"""Tests for Twilio telephony integration."""

from unittest.mock import AsyncMock, MagicMock

import pytest

from app.modules.calls.models import CallIntent
from app.modules.voice.realtime_session import SessionState
from app.modules.voice.telephony import FUNCTION_TO_INTENT, TwilioRealtimeSession


class TestFunctionToIntentMapping:
    """Tests for intent mapping."""

    def test_all_intents_mapped(self):
        """Verify all expected functions are mapped to intents."""
        assert FUNCTION_TO_INTENT["lookup_work_order"] == CallIntent.CHECK_STATUS
        assert FUNCTION_TO_INTENT["get_business_hours"] == CallIntent.GET_HOURS
        assert FUNCTION_TO_INTENT["get_location"] == CallIntent.GET_LOCATION
        assert FUNCTION_TO_INTENT["list_services"] == CallIntent.GET_SERVICES
        assert FUNCTION_TO_INTENT["transfer_to_human"] == CallIntent.TRANSFER_HUMAN
        # Booking tools
        assert FUNCTION_TO_INTENT["check_availability"] == CallIntent.SCHEDULE_APPOINTMENT
        assert FUNCTION_TO_INTENT["propose_appointment"] == CallIntent.SCHEDULE_APPOINTMENT
        assert FUNCTION_TO_INTENT["confirm_appointment"] == CallIntent.SCHEDULE_APPOINTMENT

    def test_unknown_function_returns_unknown(self):
        """Unknown functions should return UNKNOWN intent."""
        assert FUNCTION_TO_INTENT.get("nonexistent", CallIntent.UNKNOWN) == CallIntent.UNKNOWN


class TestTwilioRealtimeSession:
    """Tests for TwilioRealtimeSession class."""

    def test_initialization(self):
        """Test session initializes with correct defaults."""
        mock_ws = MagicMock()

        session = TwilioRealtimeSession(
            twilio_ws=mock_ws,
            call_sid="CA123",
            from_number="+15551234567",
            to_number="+15559876543",
        )

        assert session.call_sid == "CA123"
        assert session.session_id == "CA123"  # Uses call_sid as session_id
        assert session.from_number == "+15551234567"
        assert session.to_number == "+15559876543"
        assert session.shop_name == "Demo Auto Shop"
        assert session.state == SessionState.IDLE
        assert session.stream_sid is None
        assert session.shop_id is None

    def test_initialization_with_shop_config(self):
        """Test session with shop config."""
        from app.modules.shops.models import ShopConfig, ShopSettings

        mock_ws = MagicMock()
        config = MagicMock(spec=ShopConfig)
        config.name = "Test Auto Shop"
        config.id = "shop123"
        config.adapter_type = "mock"
        # Provide default settings so adapter/calendar resolution works
        config.settings = ShopSettings()

        session = TwilioRealtimeSession(
            twilio_ws=mock_ws,
            call_sid="CA123",
            from_number="+15551234567",
            to_number="+15559876543",
            shop_config=config,
        )

        assert session.shop_name == "Test Auto Shop"
        assert session.shop_id == "shop123"


class TestTwilioWebhooks:
    """Tests for Twilio webhook endpoints."""

    @pytest.mark.asyncio
    async def test_incoming_call_returns_twiml(self):
        """Test incoming call webhook returns valid TwiML."""
        from unittest.mock import AsyncMock, patch

        from fastapi.testclient import TestClient

        from app.main import app

        # Mock get_shop_config_by_phone to avoid database initialization
        with patch(
            "app.modules.voice.telephony.get_shop_config_by_phone", new_callable=AsyncMock
        ) as mock_get_shop:
            mock_get_shop.return_value = None  # No shop config found

            client = TestClient(app)

            response = client.post(
                "/api/twilio/incoming",
                data={
                    "CallSid": "CA123",
                    "From": "+15551234567",
                    "To": "+15559876543",
                },
            )

            assert response.status_code == 200
            assert response.headers["content-type"] == "application/xml"
            assert "<Response>" in response.text
            assert "<Connect>" in response.text
            assert "<Stream" in response.text
            assert "callSid" in response.text

    @pytest.mark.asyncio
    async def test_status_webhook(self):
        """Test call status webhook."""
        from fastapi.testclient import TestClient

        from app.main import app

        client = TestClient(app)

        response = client.post(
            "/api/twilio/status",
            data={
                "CallSid": "CA123",
                "CallStatus": "completed",
            },
        )

        assert response.status_code == 200
        assert response.text == "OK"


class TestTwilioMessageHandling:
    """Tests for Twilio message handling."""

    @pytest.mark.asyncio
    async def test_handle_connected_event(self):
        """Test handling connected event."""
        mock_ws = MagicMock()
        session = TwilioRealtimeSession(
            twilio_ws=mock_ws,
            call_sid="CA123",
            from_number="+1",
            to_number="+1",
        )

        # Should not raise
        await session.handle_twilio_message({"event": "connected"})

    @pytest.mark.asyncio
    async def test_handle_media_forwards_audio(self):
        """Test media event forwards audio to OpenAI."""
        import base64

        mock_ws = MagicMock()
        session = TwilioRealtimeSession(
            twilio_ws=mock_ws,
            call_sid="CA123",
            from_number="+1",
            to_number="+1",
        )

        # Mock client as connected (is_connected checks _connected AND _ws)
        session.client._connected = True
        session.client._ws = MagicMock()  # Mock WebSocket to pass is_connected check
        session.client.send_audio = AsyncMock()

        audio_data = b"test audio"
        payload = base64.b64encode(audio_data).decode()

        await session.handle_twilio_message(
            {
                "event": "media",
                "media": {"payload": payload},
            }
        )

        session.client.send_audio.assert_called_once()

    @pytest.mark.asyncio
    async def test_send_audio_to_twilio(self):
        """Test audio is sent to Twilio in correct format."""
        mock_ws = AsyncMock()
        session = TwilioRealtimeSession(
            twilio_ws=mock_ws,
            call_sid="CA123",
            from_number="+1",
            to_number="+1",
        )
        session.stream_sid = "MZ123"

        await session._send_audio_to_twilio(b"audio")

        mock_ws.send_json.assert_called_once()
        call_args = mock_ws.send_json.call_args[0][0]
        assert call_args["event"] == "media"
        assert call_args["streamSid"] == "MZ123"
        assert "payload" in call_args["media"]

    @pytest.mark.asyncio
    async def test_clear_twilio_buffer(self):
        """Test barge-in clears Twilio buffer."""
        mock_ws = AsyncMock()
        session = TwilioRealtimeSession(
            twilio_ws=mock_ws,
            call_sid="CA123",
            from_number="+1",
            to_number="+1",
        )
        session.stream_sid = "MZ123"

        await session._clear_twilio_buffer()

        mock_ws.send_json.assert_called_once_with(
            {
                "event": "clear",
                "streamSid": "MZ123",
            }
        )


# =============================================================================
# Integration Tests (require credentials)
# =============================================================================


@pytest.mark.asyncio
@pytest.mark.skip(reason="Requires Twilio/OpenAI credentials")
async def test_full_call_flow():
    """Test complete call flow with real services."""
    pass
