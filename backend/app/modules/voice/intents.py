"""Intent definitions and classification (Phase 2).

This module will contain:
- Intent enum definitions
- Intent classification logic using LLM
- Slot extraction for each intent type
"""

from enum import Enum


class Intent(str, Enum):
    """Supported caller intents."""

    CHECK_STATUS = "CHECK_STATUS"  # Check work order status
    GET_HOURS = "GET_HOURS"  # Get business hours
    GET_LOCATION = "GET_LOCATION"  # Get shop address/directions
    GET_SERVICES = "GET_SERVICES"  # List available services
    SCHEDULE_APPOINTMENT = "SCHEDULE_APPOINTMENT"  # Schedule service
    TRANSFER_HUMAN = "TRANSFER_HUMAN"  # Transfer to human
    UNKNOWN = "UNKNOWN"  # Unrecognized intent


# TODO: Implement intent classification using OpenAI
# TODO: Implement slot extraction for each intent type
