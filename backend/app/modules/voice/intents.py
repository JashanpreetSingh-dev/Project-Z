"""Intent definitions and classification (Phase 2).

This module will contain:
- Intent enum definitions
- Intent classification logic using LLM
- Slot extraction for each intent type
- Tool-to-intent mapping for analytics and logging
"""

from enum import Enum

from app.modules.calls.models import CallIntent


class Intent(str, Enum):
    """Supported caller intents."""

    CHECK_STATUS = "CHECK_STATUS"  # Check work order status
    GET_HOURS = "GET_HOURS"  # Get business hours
    GET_LOCATION = "GET_LOCATION"  # Get shop address/directions
    GET_SERVICES = "GET_SERVICES"  # List available services
    SCHEDULE_APPOINTMENT = "SCHEDULE_APPOINTMENT"  # Schedule service
    TRANSFER_HUMAN = "TRANSFER_HUMAN"  # Transfer to human
    UNKNOWN = "UNKNOWN"  # Unrecognized intent


# Centralized tool-to-intent mapping for analytics and logging
# This is the single source of truth for mapping tool names to CallIntent values
TOOL_TO_INTENT_MAPPING: dict[str, CallIntent] = {
    # Status/introspection tools
    "lookup_work_order": CallIntent.CHECK_STATUS,
    "get_work_order_status": CallIntent.CHECK_STATUS,
    "get_customer_vehicles": CallIntent.CHECK_STATUS,
    # Information tools
    "get_business_hours": CallIntent.GET_HOURS,
    "get_location": CallIntent.GET_LOCATION,
    "list_services": CallIntent.GET_SERVICES,
    # Booking tools
    "check_availability": CallIntent.SCHEDULE_APPOINTMENT,
    "propose_appointment": CallIntent.SCHEDULE_APPOINTMENT,
    "confirm_appointment": CallIntent.SCHEDULE_APPOINTMENT,
    # Transfer
    "transfer_to_human": CallIntent.TRANSFER_HUMAN,
}


def get_intent_for_tool(tool_name: str) -> CallIntent:
    """Get the CallIntent for a given tool name.

    Args:
        tool_name: Name of the tool/function

    Returns:
        The corresponding CallIntent, or CallIntent.UNKNOWN if not found
    """
    return TOOL_TO_INTENT_MAPPING.get(tool_name, CallIntent.UNKNOWN)


# TODO: Implement intent classification using OpenAI
# TODO: Implement slot extraction for each intent type
