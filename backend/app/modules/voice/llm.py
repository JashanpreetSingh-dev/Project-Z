"""LLM integration for intent classification and response generation.

This module provides an async OpenAI client wrapper with function calling support
for the voice receptionist AI.
"""

import json
import logging
from typing import Any

from openai import AsyncOpenAI
from openai.types.chat import ChatCompletion, ChatCompletionMessage

from app.config import get_settings

logger = logging.getLogger(__name__)


class LLMClient:
    """Async OpenAI client wrapper with function calling support."""

    def __init__(
        self,
        api_key: str | None = None,
        model: str = "gpt-4o-mini",
    ):
        """Initialize the LLM client.

        Args:
            api_key: OpenAI API key. If None, uses settings.
            model: Model to use for completions.
        """
        settings = get_settings()
        self.client = AsyncOpenAI(api_key=api_key or settings.openai_api_key)
        self.model = model

    async def chat(
        self,
        messages: list[dict[str, Any]],
        tools: list[dict[str, Any]] | None = None,
        temperature: float = 0.7,
    ) -> ChatCompletion:
        """Send a chat completion request.

        Args:
            messages: List of message dicts with role and content.
            tools: Optional list of tool definitions for function calling.
            temperature: Sampling temperature (0-2).

        Returns:
            The chat completion response.
        """
        kwargs: dict[str, Any] = {
            "model": self.model,
            "messages": messages,
            "temperature": temperature,
        }

        if tools:
            kwargs["tools"] = tools
            kwargs["tool_choice"] = "auto"

        logger.debug("Sending chat request with %d messages", len(messages))
        response = await self.client.chat.completions.create(**kwargs)
        logger.debug("Received response: %s", response.choices[0].finish_reason)

        return response

    async def chat_with_tool_loop(
        self,
        messages: list[dict[str, Any]],
        tools: list[dict[str, Any]],
        tool_executor: Any,  # Callable that executes tools
        max_iterations: int = 5,
    ) -> tuple[str, list[dict[str, Any]]]:
        """Run a chat completion with automatic tool execution loop.

        This method handles the back-and-forth of:
        1. Send message to LLM
        2. If LLM wants to call a tool, execute it
        3. Send tool result back to LLM
        4. Repeat until LLM gives a final response

        Args:
            messages: Initial messages (including system prompt).
            tools: Tool definitions for function calling.
            tool_executor: Async callable that takes (tool_name, args) and returns result.
            max_iterations: Maximum tool call iterations to prevent infinite loops.

        Returns:
            Tuple of (final_response_text, tool_calls_made)
        """
        working_messages = list(messages)  # Copy to avoid mutation
        tool_calls_made: list[dict[str, Any]] = []

        for iteration in range(max_iterations):
            response = await self.chat(working_messages, tools)
            message = response.choices[0].message

            # If no tool calls, we have our final response
            if not message.tool_calls:
                return message.content or "", tool_calls_made

            # Process tool calls
            working_messages.append(self._message_to_dict(message))

            for tool_call in message.tool_calls:
                # Skip non-function tool calls (e.g., custom tools)
                if tool_call.type != "function":
                    continue

                tool_name = tool_call.function.name
                try:
                    tool_args = json.loads(tool_call.function.arguments)
                except json.JSONDecodeError:
                    tool_args = {}

                logger.info("Executing tool: %s with args: %s", tool_name, tool_args)

                # Execute the tool
                tool_result = await tool_executor(tool_name, tool_args)

                tool_calls_made.append({
                    "tool": tool_name,
                    "args": tool_args,
                    "result": tool_result,
                })

                # Add tool result to messages
                working_messages.append({
                    "role": "tool",
                    "tool_call_id": tool_call.id,
                    "content": json.dumps(tool_result),
                })

        # If we hit max iterations, get final response without tools
        logger.warning("Hit max tool iterations (%d), forcing final response", max_iterations)
        response = await self.chat(working_messages, tools=None)
        return response.choices[0].message.content or "", tool_calls_made

    def _message_to_dict(self, message: ChatCompletionMessage) -> dict[str, Any]:
        """Convert a ChatCompletionMessage to a dict for the messages list."""
        result: dict[str, Any] = {
            "role": message.role,
        }

        if message.content:
            result["content"] = message.content

        if message.tool_calls:
            result["tool_calls"] = [
                {
                    "id": tc.id,
                    "type": "function",
                    "function": {
                        "name": tc.function.name,
                        "arguments": tc.function.arguments,
                    },
                }
                for tc in message.tool_calls
                if tc.type == "function"
            ]

        return result
