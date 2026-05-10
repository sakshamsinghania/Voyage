from typing import AsyncIterator, Iterable, Protocol

from ..llm.base import ChatChunk, ChatMessage, LLMClient
from ..retrieval.base import Retriever
from ..tools.registry import ToolRegistry


class AgentRunner(Protocol):
    """Multi-agent seam.

    v1 SingleTurnAgent passes through to the LLM with optional retrieval context.
    Future: PlannerAgent + ExecutorAgent + CriticAgent orchestrated here, each emitting
    structured events (plan_step, tool_call, tool_result, critique) that the rail consumes.
    """

    async def run(self, messages: Iterable[ChatMessage]) -> AsyncIterator[ChatChunk]: ...


class SingleTurnAgent:
    def __init__(self, llm: LLMClient, retriever: Retriever, tools: ToolRegistry):
        self.llm = llm
        self.retriever = retriever
        self.tools = tools

    async def run(self, messages: Iterable[ChatMessage]) -> AsyncIterator[ChatChunk]:
        msgs = list(messages)
        last_user = next((m for m in reversed(msgs) if m.role == "user"), None)
        if last_user:
            chunks = await self.retriever.retrieve(last_user.content)
            if chunks:
                ctx = "\n\n".join(f"[{c.source}] {c.text}" for c in chunks)
                msgs.insert(0, ChatMessage(role="system", content=f"Retrieved context:\n{ctx}"))

        async for chunk in self.llm.stream_chat(msgs):
            yield chunk
