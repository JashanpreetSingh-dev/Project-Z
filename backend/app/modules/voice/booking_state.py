"""Booking state machine for tracking appointment proposals and confirmations.

This module tracks proposed appointments per session to ensure explicit
customer confirmation before any write operations.
"""

from dataclasses import dataclass
from datetime import datetime
from typing import Any


@dataclass
class BookingState:
    """Tracks appointment proposal state for a single session.

    This ensures the AI only creates appointments that the customer
    explicitly confirmed. The state is session-scoped and cleared
    when the call ends.
    """

    proposed_date: str | None = None
    proposed_time: str | None = None
    proposed_duration_minutes: int | None = None
    timestamp: datetime | None = None
    confirmed: bool = False

    def propose(self, date: str, time: str, duration_minutes: int = 30) -> None:
        """Store a proposed appointment slot.

        Args:
            date: ISO date string (e.g., "2025-01-16")
            time: ISO time string (e.g., "15:00:00")
            duration_minutes: Duration of the appointment
        """
        from app.common.utils import utc_now

        self.proposed_date = date
        self.proposed_time = time
        self.proposed_duration_minutes = duration_minutes
        self.timestamp = utc_now()
        self.confirmed = False

    def verify_confirmation(self, date: str, time: str) -> bool:
        """Verify that the customer confirmed the proposed appointment.

        Args:
            date: Date to verify (ISO date string)
            time: Time to verify (ISO time string)

        Returns:
            True if the proposed appointment matches and was confirmed
        """
        if not self.proposed_date or not self.proposed_time:
            return False

        # Normalize date/time for comparison (handle ISO format variations)
        proposed_datetime = f"{self.proposed_date}T{self.proposed_time}"
        requested_datetime = f"{date}T{time}"

        # Allow some flexibility in time format (e.g., "15:00" vs "15:00:00")
        proposed_normalized = proposed_datetime.replace(":", "").replace("-", "").replace("T", "")
        requested_normalized = requested_datetime.replace(":", "").replace("-", "").replace("T", "")

        # Check if dates/times match (allowing for minor format differences)
        date_match = (
            self.proposed_date == date or proposed_normalized[:8] == requested_normalized[:8]
        )
        time_match = (
            self.proposed_time == time or proposed_normalized[8:12] == requested_normalized[8:12]
        )

        return date_match and time_match

    def mark_confirmed(self) -> None:
        """Mark the proposed appointment as confirmed."""
        self.confirmed = True

    def clear(self) -> None:
        """Clear the proposal state (called when call ends)."""
        self.proposed_date = None
        self.proposed_time = None
        self.proposed_duration_minutes = None
        self.timestamp = None
        self.confirmed = False

    def has_proposal(self) -> bool:
        """Check if there's an active proposal."""
        return self.proposed_date is not None and self.proposed_time is not None

    def to_dict(self) -> dict[str, Any]:
        """Convert to dictionary for logging."""
        return {
            "proposed_date": self.proposed_date,
            "proposed_time": self.proposed_time,
            "proposed_duration_minutes": self.proposed_duration_minutes,
            "timestamp": self.timestamp.isoformat() if self.timestamp else None,
            "confirmed": self.confirmed,
        }
