from fastapi import APIRouter, Depends, HTTPException
from pymongo import ASCENDING, DESCENDING

from ..auth import get_current_user
from ..db import messages_coll, sessions_coll
from ..models import message_out, new_session, session_out, utcnow
from ..schemas import SessionCreate, SessionDetail, SessionOut, SessionUpdate

router = APIRouter(prefix="/api/sessions", tags=["sessions"])


@router.get("", response_model=list[SessionOut])
def list_sessions(user: dict = Depends(get_current_user)):
    docs = sessions_coll.find({"user_id": user["_id"]}).sort("updated_at", DESCENDING)
    return [session_out(d) for d in docs]


@router.post("", response_model=SessionDetail, status_code=201)
def create_session(payload: SessionCreate, user: dict = Depends(get_current_user)):
    doc = new_session(title=payload.title, user_id=user["_id"])
    sessions_coll.insert_one(doc)
    return {**session_out(doc), "messages": []}


@router.get("/{session_id}", response_model=SessionDetail)
def get_session(session_id: str, user: dict = Depends(get_current_user)):
    doc = sessions_coll.find_one({"_id": session_id, "user_id": user["_id"]})
    if not doc:
        raise HTTPException(404, "session not found")
    msgs = messages_coll.find({"session_id": session_id}).sort("created_at", ASCENDING)
    return {**session_out(doc), "messages": [message_out(m) for m in msgs]}


@router.patch("/{session_id}", response_model=SessionOut)
def rename_session(
    session_id: str,
    payload: SessionUpdate,
    user: dict = Depends(get_current_user),
):
    res = sessions_coll.find_one_and_update(
        {"_id": session_id, "user_id": user["_id"]},
        {"$set": {"title": payload.title, "updated_at": utcnow()}},
        return_document=True,
    )
    if not res:
        raise HTTPException(404, "session not found")
    return session_out(res)


@router.delete("/{session_id}", status_code=204)
def delete_session(session_id: str, user: dict = Depends(get_current_user)):
    res = sessions_coll.delete_one({"_id": session_id, "user_id": user["_id"]})
    if res.deleted_count == 0:
        raise HTTPException(404, "session not found")
    messages_coll.delete_many({"session_id": session_id})
