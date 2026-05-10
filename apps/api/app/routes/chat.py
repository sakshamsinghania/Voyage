import json
import time
from typing import AsyncIterator

from fastapi import APIRouter, Depends, HTTPException, Request
from sqlalchemy.orm import Session as OrmSession
from sse_starlette.sse import EventSourceResponse

from ..db import get_db, SessionLocal
from ..llm.base import ChatMessage
from ..models import Message, Session
from ..schemas import ChatRequest
from ..deps import get_agent

router = APIRouter(prefix="/api/chat", tags=["chat"])


def _history(db: OrmSession, session_id: str) -> list[ChatMessage]:
    rows = (
        db.query(Message)
        .filter(Message.session_id == session_id)
        .order_by(Message.created_at.asc())
        .all()
    )
    return [ChatMessage(role=r.role, content=r.content) for r in rows if r.role in ("user", "assistant")]


@router.post("")
async def chat(payload: ChatRequest, request: Request, db: OrmSession = Depends(get_db)):
    session = db.query(Session).filter(Session.id == payload.session_id).first()
    if not session:
        raise HTTPException(404, "session not found")

    user_msg = Message(session_id=session.id, role="user", content=payload.content)
    db.add(user_msg)

    if session.title == "Untitled session":
        session.title = payload.content[:60].strip() or session.title

    db.commit()
    db.refresh(user_msg)

    history = _history(db, session.id)
    agent = get_agent()

    async def event_stream() -> AsyncIterator[dict]:
        started = time.perf_counter()
        buf: list[str] = []
        final_model: str | None = None
        in_tok: int | None = None
        out_tok: int | None = None

        yield {"event": "user_message", "data": json.dumps({
            "id": user_msg.id,
            "role": "user",
            "content": user_msg.content,
            "created_at": user_msg.created_at.isoformat(),
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

        with SessionLocal() as persist:
            assistant_row = Message(
                session_id=session.id,
                role="assistant",
                content=full,
                model=final_model,
                input_tokens=in_tok,
                output_tokens=out_tok,
                latency_ms=latency_ms,
            )
            persist.add(assistant_row)
            persist.commit()
            persist.refresh(assistant_row)
            done_payload = {
                "id": assistant_row.id,
                "role": "assistant",
                "content": full,
                "model": final_model,
                "input_tokens": in_tok,
                "output_tokens": out_tok,
                "latency_ms": latency_ms,
                "created_at": assistant_row.created_at.isoformat(),
            }

        yield {"event": "done", "data": json.dumps(done_payload)}

    return EventSourceResponse(event_stream())
