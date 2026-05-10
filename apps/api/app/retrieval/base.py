from dataclasses import dataclass, field
from typing import Protocol


@dataclass
class RetrievedChunk:
    id: str
    text: str
    source: str
    score: float = 0.0
    metadata: dict = field(default_factory=dict)


class Retriever(Protocol):
    """RAG seam. v1: NullRetriever returns []. Future: vector store + reranker."""

    async def retrieve(self, query: str, *, k: int = 5) -> list[RetrievedChunk]: ...


class NullRetriever:
    async def retrieve(self, query: str, *, k: int = 5) -> list[RetrievedChunk]:
        return []
