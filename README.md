# Voyage

AI agent research workspace. Vite React + FastAPI + Groq.

## Stack

- **Frontend**: Vite + React 18 + TypeScript + Tailwind v3
- **Backend**: FastAPI + Groq SDK + SQLAlchemy + SQLite
- **Model**: `llama-3.3-70b-versatile` via Groq (provider-abstracted)

## Layout

```
apps/
  api/   FastAPI service. Streaming chat, sessions, evolution seams.
  web/   Vite React workspace shell.
```

## Run

### Backend

```bash
cd apps/api
python -m venv .venv && source .venv/bin/activate
pip install -r requirements.txt
cp .env.example .env   # fill GROQ_API_KEY
uvicorn app.main:app --reload --port 8000
```

### Frontend

```bash
cd apps/web
npm install
npm run dev   # http://localhost:5173
```

The frontend proxies `/api/*` to `http://localhost:8000`.

## Architecture seams

The v1 ships streaming chat. The structure is sized for what's next:

- `apps/api/app/llm/` — provider abstraction (`LLMClient` protocol). Add OpenAI/Anthropic/local without touching routes.
- `apps/api/app/retrieval/` — `Retriever` protocol. v1 stub returns `[]`. Drop in vector store + chunker for RAG.
- `apps/api/app/tools/` — `ToolRegistry`. Tools register a JSON schema + handler. Wire to model tool-use loop when ready.
- `apps/api/app/agents/` — `AgentRunner`. v1 single-turn pass-through. Becomes orchestrator for plan/execute/critic agents.

Frontend rail (`Sources / Agents / Tools`) is wired with empty states ready to consume each seam's output.
