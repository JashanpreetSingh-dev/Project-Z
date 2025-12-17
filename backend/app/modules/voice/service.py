"""Voice conversation orchestration service.

This module coordinates the LLM, tools, and adapters to handle
a complete conversation with the voice receptionist.
"""

import logging
import uuid
from dataclasses import dataclass, field
from typing import Any

from app.adapters import get_shop_adapter
from app.adapters.base import ShopSystemAdapter
from app.modules.shops.models import ShopConfig
from app.modules.voice.llm import LLMClient
from app.modules.voice.prompts import get_system_prompt
from app.modules.voice.tools import ToolRegistry

logger = logging.getLogger(__name__)


@dataclass
class ConversationResult:
    """Result from processing a message."""

    response: str
    intent: str | None = None
    tool_called: str | None = None
    tools_used: list[dict[str, Any]] = field(default_factory=list)
    should_transfer: bool = False
    transfer_reason: str | None = None


def get_adapter_for_config(config: ShopConfig | None) -> ShopSystemAdapter:
    """Backward-compatible wrapper around the central adapter registry.

    This delegates to app.adapters.get_shop_adapter so that adapter
    selection is centralized. Existing call sites can keep using this
    helper while new code can import get_shop_adapter directly.
    """

    # Note: AdapterType remains defined here for backwards compatibility
    # and future expansion, but the actual routing logic now lives in
    # the adapter registry.
    return get_shop_adapter(config)


class ConversationService:
    """Orchestrates LLM + Tools for a voice conversation."""

    def __init__(
        self,
        shop_config: ShopConfig | None = None,
        conversation_id: str | None = None,
    ):
        """Initialize conversation service.

        Args:
            shop_config: Shop configuration for adapter selection.
            conversation_id: Optional ID for conversation continuity.
        """
        self.shop_config = shop_config
        self.shop_name = shop_config.name if shop_config else "Demo Auto Shop"
        self.conversation_id = conversation_id or str(uuid.uuid4())

        # Set up components
        self.adapter = get_adapter_for_config(shop_config)
        self.tools = ToolRegistry(self.adapter)
        self.llm = LLMClient()

        # Conversation state
        self.messages: list[dict[str, Any]] = [
            {"role": "system", "content": get_system_prompt(self.shop_name)}
        ]

    async def process_message(self, user_input: str) -> ConversationResult:
        """Process a user message and return the AI response.

        Args:
            user_input: The user's message (transcript from speech or text).

        Returns:
            ConversationResult with response and metadata.
        """
        logger.info("Processing message: %s", user_input[:100])

        # Add user message to history
        self.messages.append({"role": "user", "content": user_input})

        # Run LLM with tool loop
        response_text, tools_used = await self.llm.chat_with_tool_loop(
            messages=self.messages,
            tools=self.tools.get_tools_schema(),
            tool_executor=self.tools.execute,
        )

        # Add assistant response to history
        self.messages.append({"role": "assistant", "content": response_text})

        # Analyze results
        result = ConversationResult(
            response=response_text,
            tools_used=tools_used,
        )

        # Determine intent and check for transfer
        if tools_used:
            last_tool = tools_used[-1]
            result.tool_called = last_tool["tool"]
            result.intent = self._tool_to_intent(last_tool["tool"])

            # Check if transfer was requested
            if last_tool["tool"] == "transfer_to_human":
                result.should_transfer = True
                result.transfer_reason = last_tool.get("args", {}).get("reason")

        logger.info(
            "Response generated: intent=%s, tool=%s, transfer=%s",
            result.intent,
            result.tool_called,
            result.should_transfer,
        )

        return result

    def _tool_to_intent(self, tool_name: str) -> str:
        """Map tool name to intent for logging/analytics."""
        from app.modules.voice.intents import get_intent_for_tool

        intent = get_intent_for_tool(tool_name)
        return intent.value

    def get_conversation_id(self) -> str:
        """Get the conversation ID for continuity."""
        return self.conversation_id


# In-memory conversation storage for continuity
_conversations: dict[str, ConversationService] = {}


def get_or_create_conversation(
    conversation_id: str | None = None,
    shop_config: ShopConfig | None = None,
) -> ConversationService:
    """Get an existing conversation or create a new one.

    Args:
        conversation_id: Optional ID to resume a conversation.
        shop_config: Shop configuration for new conversations.

    Returns:
        The conversation service instance.
    """
    if conversation_id and conversation_id in _conversations:
        return _conversations[conversation_id]

    service = ConversationService(shop_config, conversation_id)
    _conversations[service.conversation_id] = service

    # Limit stored conversations to prevent memory leak
    if len(_conversations) > 1000:
        # Remove oldest conversations
        oldest_ids = list(_conversations.keys())[:100]
        for old_id in oldest_ids:
            del _conversations[old_id]

    return service


def clear_conversation(conversation_id: str) -> None:
    """Clear a conversation from memory.

    Args:
        conversation_id: The conversation to clear.
    """
    _conversations.pop(conversation_id, None)
