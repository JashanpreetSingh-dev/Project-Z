"""Tests for voice module."""

import pytest

from app.modules.voice.prompts import get_system_prompt
from app.modules.voice.service import (
    ConversationResult,
    ConversationService,
    get_or_create_conversation,
)


def test_system_prompt_formatting():
    """Test that system prompt formats correctly."""
    prompt = get_system_prompt("Mike's Auto Shop")

    assert "Mike's Auto Shop" in prompt
    assert "auto repair shop" in prompt
    assert "friendly and professional" in prompt


def test_conversation_service_initialization():
    """Test ConversationService initializes correctly."""
    service = ConversationService()

    assert service.shop_name == "Demo Auto Shop"
    assert service.conversation_id is not None
    assert len(service.messages) == 1  # System prompt
    assert service.messages[0]["role"] == "system"


def test_get_or_create_conversation_new():
    """Test creating a new conversation."""
    service = get_or_create_conversation()

    assert service.conversation_id is not None
    assert isinstance(service, ConversationService)


def test_get_or_create_conversation_existing():
    """Test getting an existing conversation."""
    service1 = get_or_create_conversation()
    conv_id = service1.conversation_id

    service2 = get_or_create_conversation(conversation_id=conv_id)

    assert service1 is service2


def test_conversation_result_dataclass():
    """Test ConversationResult dataclass."""
    result = ConversationResult(
        response="Hello!",
        intent="GET_HOURS",
        tool_called="get_business_hours",
    )

    assert result.response == "Hello!"
    assert result.intent == "GET_HOURS"
    assert result.tool_called == "get_business_hours"
    assert result.should_transfer is False
    assert result.tools_used == []


def test_tool_to_intent_mapping():
    """Test tool to intent mapping."""
    service = ConversationService()

    assert service._tool_to_intent("lookup_work_order") == "CHECK_STATUS"
    assert service._tool_to_intent("get_business_hours") == "GET_HOURS"
    assert service._tool_to_intent("get_location") == "GET_LOCATION"
    assert service._tool_to_intent("list_services") == "GET_SERVICES"
    assert service._tool_to_intent("transfer_to_human") == "TRANSFER_HUMAN"
    assert service._tool_to_intent("unknown_tool") == "UNKNOWN"


# ============================================
# Integration tests (require OpenAI API key)
# ============================================


@pytest.mark.asyncio
@pytest.mark.skip(reason="Requires OpenAI API key")
async def test_process_message_check_status():
    """Test processing a status check message."""
    service = ConversationService()
    result = await service.process_message("Is my car ready? My name is John Smith")

    assert result.response
    assert result.intent == "CHECK_STATUS"
    assert result.tool_called == "lookup_work_order"


@pytest.mark.asyncio
@pytest.mark.skip(reason="Requires OpenAI API key")
async def test_process_message_business_hours():
    """Test processing a business hours request."""
    service = ConversationService()
    result = await service.process_message("What time do you close?")

    assert result.response
    assert result.intent == "GET_HOURS"
    assert result.tool_called == "get_business_hours"


@pytest.mark.asyncio
@pytest.mark.skip(reason="Requires OpenAI API key")
async def test_process_message_transfer():
    """Test processing a transfer request."""
    service = ConversationService()
    result = await service.process_message("I need to speak to a manager")

    assert result.response
    assert result.should_transfer is True
    assert result.intent == "TRANSFER_HUMAN"
