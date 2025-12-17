"""Base calendar adapter interface for appointment booking.

This module defines the interface that all calendar adapters must implement.
Each adapter supports reading availability and creating appointments.
"""

from abc import ABC, abstractmethod
from dataclasses import dataclass
from datetime import datetime
from typing import Any


@dataclass
class AppointmentData:
    """Data structure for creating an appointment."""

    calendar_id: str
    start_time: datetime
    end_time: datetime
    summary: str
    source: str = "ai_voice"
    caller_phone: str | None = None
    description: str | None = None

    def to_dict(self) -> dict[str, Any]:
        """Convert to dictionary for API calls."""
        return {
            "calendar_id": self.calendar_id,
            "start_time": self.start_time.isoformat(),
            "end_time": self.end_time.isoformat(),
            "summary": self.summary,
            "source": self.source,
            "caller_phone": self.caller_phone,
            "description": self.description,
        }


class CalendarCapabilities:
    """Capability flags for calendar adapters."""

    READ_AVAILABILITY = "read_availability"
    READ_APPOINTMENTS = "read_appointments"
    CREATE_APPOINTMENTS = "create_appointments"


class CalendarAdapter(ABC):
    """Abstract adapter for calendar systems.

    This interface allows the AI to check availability and create appointments
    across different calendar providers (Google Calendar, Outlook, etc.).
    """

    @abstractmethod
    def get_capabilities(self) -> dict[str, bool]:
        """Get what this calendar adapter can do.

        Returns:
            Dictionary with capability flags:
            - read_availability: Can check available time slots
            - read_appointments: Can read existing appointments
            - create_appointments: Can create new appointments
        """
        ...

    @abstractmethod
    async def check_availability(
        self, start: datetime, end: datetime, duration_minutes: int = 30
    ) -> list[dict[str, Any]]:
        """Find available time slots within a date range.

        Args:
            start: Start of the date range to check
            end: End of the date range to check
            duration_minutes: Duration of appointment slots to find

        Returns:
            List of available time slots, each with:
            - start: ISO datetime string
            - end: ISO datetime string
            - duration_minutes: Duration of the slot
        """
        ...

    @abstractmethod
    async def create_appointment(self, appointment: AppointmentData) -> dict[str, Any]:
        """Create a new appointment in the calendar.

        Args:
            appointment: Appointment data to create

        Returns:
            Dictionary with:
            - success: bool
            - appointment_id: str (if successful)
            - error: str (if failed)
        """
        ...

    @abstractmethod
    async def get_appointments(self, start: datetime, end: datetime) -> list[dict[str, Any]]:
        """Get existing appointments within a date range.

        Args:
            start: Start of the date range
            end: End of the date range

        Returns:
            List of appointments, each with:
            - id: Appointment ID
            - start: ISO datetime string
            - end: ISO datetime string
            - summary: Appointment title
        """
        ...
