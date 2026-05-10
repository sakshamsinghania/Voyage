from dataclasses import dataclass, field
from typing import Any, Awaitable, Callable


Handler = Callable[[dict[str, Any]], Awaitable[Any]]


@dataclass
class Tool:
    name: str
    description: str
    parameters: dict  # JSON Schema
    handler: Handler


@dataclass
class ToolCall:
    id: str
    name: str
    arguments: dict[str, Any]


@dataclass
class ToolResult:
    call_id: str
    name: str
    output: Any
    error: str | None = None


class ToolRegistry:
    """v1 is empty. Register tools (web_search, fetch_url, run_python) as features land."""

    def __init__(self) -> None:
        self._tools: dict[str, Tool] = {}

    def register(self, tool: Tool) -> None:
        self._tools[tool.name] = tool

    def schemas(self) -> list[dict]:
        return [
            {
                "type": "function",
                "function": {
                    "name": t.name,
                    "description": t.description,
                    "parameters": t.parameters,
                },
            }
            for t in self._tools.values()
        ]

    async def call(self, call: ToolCall) -> ToolResult:
        tool = self._tools.get(call.name)
        if tool is None:
            return ToolResult(call_id=call.id, name=call.name, output=None, error=f"unknown tool: {call.name}")
        try:
            output = await tool.handler(call.arguments)
            return ToolResult(call_id=call.id, name=call.name, output=output)
        except Exception as e:
            return ToolResult(call_id=call.id, name=call.name, output=None, error=str(e))


registry = ToolRegistry()
