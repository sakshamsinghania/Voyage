from datetime import datetime
from uuid import uuid4


def new_id() -> str:
    return uuid4().hex


def utcnow() -> datetime:
    return datetime.utcnow()


def new_user(email: str, password_hash: str) -> dict:
    now = utcnow()
    return {
        "_id": new_id(),
        "email": email.lower().strip(),
        "password_hash": password_hash,
        "created_at": now,
        "updated_at": now,
    }


def user_out(doc: dict) -> dict:
    return {
        "id": doc["_id"],
        "email": doc["email"],
        "created_at": doc["created_at"],
    }


def new_session(title: str | None = None, user_id: str = "local") -> dict:
    now = utcnow()
    return {
        "_id": new_id(),
        "title": title or "Untitled session",
        "user_id": user_id,
        "created_at": now,
        "updated_at": now,
    }


def new_message(
    session_id: str,
    role: str,
    content: str,
    model: str | None = None,
    input_tokens: int | None = None,
    output_tokens: int | None = None,
    latency_ms: int | None = None,
) -> dict:
    return {
        "_id": new_id(),
        "session_id": session_id,
        "role": role,
        "content": content,
        "model": model,
        "input_tokens": input_tokens,
        "output_tokens": output_tokens,
        "latency_ms": latency_ms,
        "created_at": utcnow(),
    }


def session_out(doc: dict) -> dict:
    return {
        "id": doc["_id"],
        "title": doc["title"],
        "created_at": doc["created_at"],
        "updated_at": doc["updated_at"],
    }


def message_out(doc: dict) -> dict:
    return {
        "id": doc["_id"],
        "role": doc["role"],
        "content": doc.get("content", ""),
        "model": doc.get("model"),
        "input_tokens": doc.get("input_tokens"),
        "output_tokens": doc.get("output_tokens"),
        "latency_ms": doc.get("latency_ms"),
        "created_at": doc["created_at"],
    }
