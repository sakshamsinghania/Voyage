from dataclasses import dataclass
from typing import AsyncIterator, Iterable, Literal, Protocol, Optional


Role = Literal["user", "assistant", "system", "tool"]


@dataclass
class ChatMessage:
    role: Role
    content: str


@dataclass
class ChatChunk:
    """Streaming chunk emitted by an LLMClient.

    `delta` is the incremental text. When `done=True`, `usage` and `model` are populated
    on the final chunk and `delta` is empty.
    """

    delta: str = ""
    done: bool = False
    model: Optional[str] = None
    input_tokens: Optional[int] = None
    output_tokens: Optional[int] = None


class LLMClient(Protocol):
    """Provider-agnostic streaming chat interface.

    Implementations: GroqClient (v1). Future: AnthropicClient, OpenAIClient, LocalClient.
    Routes depend on this Protocol, never on a concrete provider.
    """

    async def stream_chat(
        self,
        messages: Iterable[ChatMessage],
        *,
        model: Optional[str] = None,
    ) -> AsyncIterator[ChatChunk]: ...
