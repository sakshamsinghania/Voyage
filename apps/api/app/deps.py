from functools import lru_cache

from .agents.runner import SingleTurnAgent, AgentRunner
from .config import settings
from .llm.groq_client import GroqClient
from .retrieval.base import NullRetriever
from .tools.registry import registry as tool_registry


@lru_cache(maxsize=1)
def get_agent() -> AgentRunner:
    if not settings.groq_api_key:
        raise RuntimeError("GROQ_API_KEY missing. Copy .env.example to .env and set it.")
    llm = GroqClient(api_key=settings.groq_api_key, default_model=settings.groq_model)
    return SingleTurnAgent(llm=llm, retriever=NullRetriever(), tools=tool_registry)
