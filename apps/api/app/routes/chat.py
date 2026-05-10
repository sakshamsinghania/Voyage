import json
import time
from typing import AsyncIterator

from fastapi import APIRouter, Depends, HTTPException, Request
from pymongo import ASCENDING
from sse_starlette.sse import EventSourceResponse

from ..auth import get_current_user
from ..db import messages_coll, sessions_coll
from ..deps import get_agent
from ..llm.base import ChatMessage
from ..models import new_message, utcnow
from ..schemas import ChatRequest

router = APIRouter(prefix="/api/chat", tags=["chat"])


def _history(session_id: str) -> list[ChatMessage]:
    rows = messages_coll.find(
        {"session_id": session_id, "role": {"$in": ["user", "assistant"]}}
    ).sort("created_at", ASCENDING)
    return [ChatMessage(role=r["role"], content=r.get("content", "")) for r in rows]


@router.post("")
async def chat(
    payload: ChatRequest,
    request: Request,
    user: dict = Depends(get_current_user),
):
    session = sessions_coll.find_one({"_id": payload.session_id, "user_id": user["_id"]})
    if not session:
        raise HTTPException(404, "session not found")

    user_msg = new_message(session_id=session["_id"], role="user", content=payload.content)
    messages_coll.insert_one(user_msg)

    update = {"updated_at": utcnow()}
    if session.get("title") == "Untitled session":
        new_title = payload.content[:60].strip() or session["title"]
        update["title"] = new_title
    sessions_coll.update_one({"_id": session["_id"]}, {"$set": update})

    history = _history(session["_id"])
    agent = get_agent()
    session_id = session["_id"]

    async def event_stream() -> AsyncIterator[dict]:
        started = time.perf_counter()
        buf: list[str] = []
        final_model: str | None = None
        in_tok: int | None = None
        out_tok: int | None = None

        yield {"event": "user_message", "data": json.dumps({
            "id": user_msg["_id"],
            "role": "user",
            "content": user_msg["content"],
            "created_at": user_msg["created_at"].isoformat(),
        })}

        try:
            async for chunk in agent.run(history):
                if await request.is_disconnected():
                    break
                if chunk.done:
                    final_model = chunk.model
                    in_tok = chunk.input_tokens
                    out_tok = chunk.output_tokens
                    break
                if chunk.delta:
                    buf.append(chunk.delta)
                    yield {"event": "delta", "data": json.dumps({"text": chunk.delta})}
        except Exception as e:
            yield {"event": "error", "data": json.dumps({"message": str(e)})}
            return

        latency_ms = int((time.perf_counter() - started) * 1000)
        full = "".join(buf)

        assistant_row = new_message(
            session_id=session_id,
            role="assistant",
            content=full,
            model=final_model,
            input_tokens=in_tok,
            output_tokens=out_tok,
            latency_ms=latency_ms,
        )
        messages_coll.insert_one(assistant_row)
        sessions_coll.update_one({"_id": session_id}, {"$set": {"updated_at": utcnow()}})

        done_payload = {
            "id": assistant_row["_id"],
            "role": "assistant",
            "content": full,
            "model": final_model,
            "input_tokens": in_tok,
            "output_tokens": out_tok,
            "latency_ms": latency_ms,
            "created_at": assistant_row["created_at"].isoformat(),
        }

        yield {"event": "done", "data": json.dumps(done_payload)}

    return EventSourceResponse(event_stream())
