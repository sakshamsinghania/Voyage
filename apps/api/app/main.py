from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from .config import settings
from .db import Base, engine
from .routes import chat, sessions

Base.metadata.create_all(bind=engine)

app = FastAPI(title="Voyage API", version="0.1.0")

app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.cors_origins_list,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(sessions.router)
app.include_router(chat.router)


@app.get("/api/health")
def health():
    return {"status": "ok", "model": settings.groq_model}
