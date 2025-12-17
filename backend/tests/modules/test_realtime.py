"""Tests for OpenAI Realtime API integration."""

import asyncio
from unittest.mock import MagicMock

import pytest

from app.modules.voice.realtime import RealtimeClient, RealtimeEventType
from app.modules.voice.realtime_session import (
    RealtimeSession,
    SessionMetrics,
    SessionState,
    get_session,
    register_session,
    unregister_session,
)
from app.modules.voice.tools import ToolRegistry

# ============================================
# RealtimeClient Tests
# ============================================


class TestRealtimeClient:
    """Tests for RealtimeClient class."""

    def test_initialization(self):
        """Test client initializes with correct defaults."""
        client = RealtimeClient(api_key="test-key")

        assert client.api_key == "test-key"
        assert client.model == "gpt-4o-realtime-preview"
        assert client.is_connected is False

    def test_initialization_custom_model(self):
        """Test client with custom model."""
        client = RealtimeClient(api_key="test-key", model="gpt-4o-realtime-preview-2024-12-17")

        assert client.model == "gpt-4o-realtime-preview-2024-12-17"

    def test_parse_event(self):
        """Test event parsing."""
        client = RealtimeClient(api_key="test-key")

        raw_data = {
            "type": "session.created",
            "session": {"id": "sess_123"},
        }

        event = client._parse_event(raw_data)

        assert event.type == "session.created"
        assert event.data == raw_data
        assert event.raw == raw_data

    @pytest.mark.asyncio
    async def test_send_without_connection(self):
        """Test sending without connection raises error."""
        client = RealtimeClient(api_key="test-key")

        with pytest.raises(ConnectionError):
            await client.send({"type": "test"})

    @pytest.mark.asyncio
    async def test_send_audio_without_connection(self):
        """Test sending audio without connection raises error."""
        client = RealtimeClient(api_key="test-key")

        with pytest.raises(ConnectionError):
            await client.send_audio(b"test audio")


class TestRealtimeEventType:
    """Tests for RealtimeEventType enum."""

    def test_event_types_exist(self):
        """Test all expected event types are defined."""
        assert RealtimeEventType.SESSION_CREATED == "session.created"
        assert RealtimeEventType.SPEECH_STARTED == "input_audio_buffer.speech_started"
        assert RealtimeEventType.AUDIO_DELTA == "response.audio.delta"
        assert RealtimeEventType.FUNCTION_CALL_ARGS_DONE == "response.function_call_arguments.done"
        assert RealtimeEventType.ERROR == "error"


# ============================================
# RealtimeSession Tests
# ============================================


class TestRealtimeSession:
    """Tests for RealtimeSession class."""

    def test_initialization(self):
        """Test session initializes with correct defaults."""
        session = RealtimeSession()

        assert session.session_id is not None
        assert session.shop_name == "Demo Auto Shop"
        assert session.state == SessionState.IDLE

    def test_initialization_with_shop_config(self):
        """Test session with shop config."""
        from app.modules.shops.models import ShopConfig, ShopSettings

        config = MagicMock(spec=ShopConfig)
        config.name = "Test Auto Shop"
        config.adapter_type = "mock"
        # Provide default settings so adapter/calendar resolution works
        config.settings = ShopSettings()

        session = RealtimeSession(shop_config=config)

        assert session.shop_name == "Test Auto Shop"

    def test_metrics_initialization(self):
        """Test session metrics are initialized."""
        session = RealtimeSession()

        assert isinstance(session.metrics, SessionMetrics)
        assert session.metrics.session_id == session.session_id
        assert session.metrics.total_audio_in_bytes == 0
        assert session.metrics.total_audio_out_bytes == 0
        assert session.metrics.tool_calls == []

    @pytest.mark.asyncio
    async def test_state_change_callback(self):
        """Test state change triggers callback."""
        callback_called = []

        async def on_state_change(state: SessionState):
            callback_called.append(state)

        session = RealtimeSession(on_state_change=on_state_change)
        await session._set_state(SessionState.CONNECTING)

        assert SessionState.CONNECTING in callback_called

    @pytest.mark.asyncio
    async def test_send_audio_not_connected(self):
        """Test sending audio when not connected logs warning."""
        session = RealtimeSession()

        # Should not raise, just log warning
        await session.send_audio(b"test audio")

        # Metrics should not be updated
        assert session.metrics.total_audio_in_bytes == 0


class TestSessionState:
    """Tests for SessionState enum."""

    def test_all_states_exist(self):
        """Test all expected states are defined."""
        assert SessionState.IDLE == "idle"
        assert SessionState.CONNECTING == "connecting"
        assert SessionState.LISTENING == "listening"
        assert SessionState.PROCESSING == "processing"
        assert SessionState.SPEAKING == "speaking"
        assert SessionState.ENDED == "ended"
        assert SessionState.ERROR == "error"


class TestSessionMetrics:
    """Tests for SessionMetrics dataclass."""

    def test_initialization(self):
        """Test metrics initialize with defaults."""
        metrics = SessionMetrics(session_id="test-123")

        assert metrics.session_id == "test-123"
        assert metrics.start_time == 0.0
        assert metrics.end_time == 0.0
        assert metrics.total_audio_in_bytes == 0
        assert metrics.total_audio_out_bytes == 0
        assert metrics.tool_calls == []
        assert metrics.transcripts == []
        assert metrics.errors == []


# ============================================
# Session Management Tests
# ============================================


class TestSessionManagement:
    """Tests for session registration functions."""

    def test_register_and_get_session(self):
        """Test registering and retrieving a session."""
        session = RealtimeSession()
        register_session(session)

        retrieved = get_session(session.session_id)
        assert retrieved is session

        # Cleanup
        unregister_session(session.session_id)

    def test_get_nonexistent_session(self):
        """Test getting a session that doesn't exist."""
        result = get_session("nonexistent-id")
        assert result is None

    def test_unregister_session(self):
        """Test unregistering a session."""
        session = RealtimeSession()
        register_session(session)
        unregister_session(session.session_id)

        result = get_session(session.session_id)
        assert result is None

    def test_unregister_nonexistent_session(self):
        """Test unregistering a session that doesn't exist doesn't raise."""
        # Should not raise
        unregister_session("nonexistent-id")


# ============================================
# Tool Schema Tests
# ============================================


class TestToolRegistryRealtime:
    """Tests for ToolRegistry Realtime schema conversion."""

    def test_get_realtime_tools_schema(self):
        """Test Realtime API schema format."""
        from app.adapters.mock import MockAdapter

        adapter = MockAdapter()
        registry = ToolRegistry(adapter)

        realtime_schema = registry.get_realtime_tools_schema()

        assert len(realtime_schema) > 0

        # Check format of first tool
        tool = realtime_schema[0]
        assert tool["type"] == "function"
        assert "name" in tool
        assert "description" in tool
        assert "parameters" in tool

        # Should NOT have nested "function" key (that's Chat Completions format)
        assert "function" not in tool

    def test_schema_conversion_preserves_all_tools(self):
        """Test all tools are converted."""
        from app.adapters.mock import MockAdapter

        adapter = MockAdapter()
        registry = ToolRegistry(adapter)

        chat_schema = registry.get_tools_schema()
        realtime_schema = registry.get_realtime_tools_schema()

        assert len(realtime_schema) == len(chat_schema)

        chat_names = {t["function"]["name"] for t in chat_schema}
        realtime_names = {t["name"] for t in realtime_schema}

        assert chat_names == realtime_names


# ============================================
# Integration Tests (require OpenAI API key)
# ============================================


@pytest.mark.asyncio
@pytest.mark.skip(reason="Requires OpenAI API key and network access")
async def test_realtime_client_connection():
    """Test actual connection to OpenAI Realtime API."""
    import os

    api_key = os.environ.get("OPENAI_API_KEY", "")
    if not api_key:
        pytest.skip("OPENAI_API_KEY not set")

    client = RealtimeClient(api_key=api_key)

    try:
        await client.connect()
        assert client.is_connected is True

        # Wait for session.created event
        async for event in client.receive():
            if event.type == RealtimeEventType.SESSION_CREATED:
                break

    finally:
        await client.close()
        assert not client.is_connected


@pytest.mark.asyncio
@pytest.mark.skip(reason="Requires OpenAI API key and network access")
async def test_realtime_session_text_message():
    """Test sending a text message through RealtimeSession."""
    import os

    api_key = os.environ.get("OPENAI_API_KEY", "")
    if not api_key:
        pytest.skip("OPENAI_API_KEY not set")

    transcripts = []

    async def on_transcript(role: str, text: str):
        transcripts.append({"role": role, "text": text})

    session = RealtimeSession(on_transcript=on_transcript)

    try:
        await session.start()
        assert session.state == SessionState.LISTENING

        await session.send_text("What are your business hours?")

        # Wait for response
        await asyncio.sleep(5)

        assert len(transcripts) > 0

    finally:
        await session.stop()
        assert session.state == SessionState.ENDED
