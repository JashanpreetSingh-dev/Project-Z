"""Call log model for tracking AI receptionist interactions."""

from datetime import datetime
from enum import Enum
from typing import Any, Optional

from beanie import Document, Indexed
from pydantic import Field


class CallIntent(str, Enum):
    """Detected caller intent."""

    CHECK_STATUS = "CHECK_STATUS"
    GET_HOURS = "GET_HOURS"
    GET_LOCATION = "GET_LOCATION"
    GET_SERVICES = "GET_SERVICES"
    TRANSFER_HUMAN = "TRANSFER_HUMAN"
    UNKNOWN = "UNKNOWN"


class CallOutcome(str, Enum):
    """Final outcome of the call."""

    RESOLVED = "RESOLVED"  # AI successfully handled the request
    TRANSFERRED = "TRANSFERRED"  # Call was transferred to human
    ABANDONED = "ABANDONED"  # Caller hung up
    FAILED = "FAILED"  # System error or unable to help
    TIMEOUT = "TIMEOUT"  # Call exceeded time limit


class CallLog(Document):
    """Call log document for tracking AI interactions."""

    # References
    shop_id: Indexed(str) = Field(..., description="Reference to shop")  # type: ignore
    work_order_id: Optional[str] = Field(None, description="Referenced work order if applicable")

    # Call metadata
    call_sid: Optional[str] = Field(None, description="Telephony provider call ID")
    caller_number: Optional[str] = Field(None, description="Caller phone number (if available)")

    # Timing
    timestamp: Indexed(datetime) = Field(default_factory=datetime.utcnow)  # type: ignore
    duration_seconds: Optional[int] = Field(None, description="Call duration in seconds")

    # Intent & AI
    intent: CallIntent = Field(default=CallIntent.UNKNOWN)
    confidence: float = Field(default=0.0, ge=0.0, le=1.0, description="Intent confidence score")
    outcome: CallOutcome = Field(default=CallOutcome.FAILED)

    # Extracted data (flexible schema)
    slots: dict[str, Any] = Field(
        default={},
        description="Extracted slot values (customer_name, vehicle, etc.)",
    )

    # Tool execution results
    tool_called: Optional[str] = Field(None, description="Name of tool executed")
    tool_results: dict[str, Any] = Field(
        default={},
        description="Results from tool execution",
    )

    # Additional context
    fallback_used: bool = Field(default=False, description="Whether fallback logic was triggered")
    transfer_reason: Optional[str] = Field(None, description="Reason for transfer if applicable")
    metadata: dict[str, Any] = Field(default={}, description="Additional metadata")

    class Settings:
        name = "call_logs"
        use_state_management = True

    def __str__(self) -> str:
        return f"CallLog({self.intent}, {self.outcome})"
