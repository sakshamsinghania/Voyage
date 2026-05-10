from datetime import datetime
from typing import Literal, Optional
from pydantic import BaseModel, Field


Role = Literal["user", "assistant", "system", "tool"]


class MessageOut(BaseModel):
    id: str
    role: Role
    content: str
    model: Optional[str] = None
    input_tokens: Optional[int] = None
    output_tokens: Optional[int] = None
    latency_ms: Optional[int] = None
    created_at: datetime

    class Config:
        from_attributes = True


class SessionOut(BaseModel):
    id: str
    title: str
    created_at: datetime
    updated_at: datetime

    class Config:
        from_attributes = True


class SessionDetail(SessionOut):
    messages: list[MessageOut] = []


class SessionCreate(BaseModel):
    title: Optional[str] = None


class SessionUpdate(BaseModel):
    title: str = Field(min_length=1, max_length=200)


class ChatRequest(BaseModel):
    session_id: str
    content: str = Field(min_length=1)
