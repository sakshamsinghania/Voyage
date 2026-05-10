from typing import AsyncIterator, Iterable, Optional

from groq import AsyncGroq

from .base import ChatChunk, ChatMessage


SYSTEM_PROMPT = (
    "You are Voyage, a research assistant for technical practitioners. "
    "Be precise, dense with information, and structured. "
    "Prefer tight prose, code blocks, and tables over bullets when explaining systems. "
    "Cite assumptions explicitly. Never invent sources. "
    "When asked to research, lay out: (1) what you know, (2) what you don't, (3) how you'd verify."
)


class GroqClient:
    def __init__(self, api_key: str, default_model: str):
        self._client = AsyncGroq(api_key=api_key)
        self._default_model = default_model

    async def stream_chat(
        self,
        messages: Iterable[ChatMessage],
        *,
        model: Optional[str] = None,
    ) -> AsyncIterator[ChatChunk]:
        msgs = [{"role": "system", "content": SYSTEM_PROMPT}]
        msgs.extend({"role": m.role, "content": m.content} for m in messages)
        used_model = model or self._default_model

        stream = await self._client.chat.completions.create(
            model=used_model,
            messages=msgs,
            stream=True,
            temperature=0.4,
        )

        input_tok: Optional[int] = None
        output_tok: Optional[int] = None

        async for event in stream:
            choice = event.choices[0] if event.choices else None
            if choice and choice.delta and choice.delta.content:
                yield ChatChunk(delta=choice.delta.content)
            usage = getattr(event, "x_groq", None)
            if usage and getattr(usage, "usage", None):
                input_tok = usage.usage.prompt_tokens
                output_tok = usage.usage.completion_tokens

        yield ChatChunk(
            done=True,
            model=used_model,
            input_tokens=input_tok,
            output_tokens=output_tok,
        )
