from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session as OrmSession

from ..db import get_db
from ..models import Session, Message
from ..schemas import SessionCreate, SessionDetail, SessionOut, SessionUpdate

router = APIRouter(prefix="/api/sessions", tags=["sessions"])


@router.get("", response_model=list[SessionOut])
def list_sessions(db: OrmSession = Depends(get_db)):
    return db.query(Session).order_by(Session.updated_at.desc()).all()


@router.post("", response_model=SessionDetail, status_code=201)
def create_session(payload: SessionCreate, db: OrmSession = Depends(get_db)):
    s = Session(title=payload.title or "Untitled session")
    db.add(s)
    db.commit()
    db.refresh(s)
    return s


@router.get("/{session_id}", response_model=SessionDetail)
def get_session(session_id: str, db: OrmSession = Depends(get_db)):
    s = db.query(Session).filter(Session.id == session_id).first()
    if not s:
        raise HTTPException(404, "session not found")
    return s


@router.patch("/{session_id}", response_model=SessionOut)
def rename_session(session_id: str, payload: SessionUpdate, db: OrmSession = Depends(get_db)):
    s = db.query(Session).filter(Session.id == session_id).first()
    if not s:
        raise HTTPException(404, "session not found")
    s.title = payload.title
    db.commit()
    db.refresh(s)
    return s


@router.delete("/{session_id}", status_code=204)
def delete_session(session_id: str, db: OrmSession = Depends(get_db)):
    s = db.query(Session).filter(Session.id == session_id).first()
    if not s:
        raise HTTPException(404, "session not found")
    db.delete(s)
    db.commit()
