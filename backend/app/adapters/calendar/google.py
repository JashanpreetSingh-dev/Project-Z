"""Google Calendar adapter implementation."""

import logging
from datetime import datetime, timedelta
from typing import Any

from google.auth.transport.requests import Request  # type: ignore[import-untyped]
from google.oauth2.credentials import Credentials  # type: ignore[import-untyped]
from googleapiclient.discovery import build  # type: ignore[import-untyped]
from googleapiclient.errors import HttpError  # type: ignore[import-untyped]

from app.adapters.calendar.base import (
    AppointmentData,
    CalendarAdapter,
    CalendarCapabilities,
)

logger = logging.getLogger(__name__)


class GoogleCalendarAdapter(CalendarAdapter):
    """Google Calendar adapter using OAuth2 authentication."""

    SCOPES = ["https://www.googleapis.com/auth/calendar"]

    def __init__(
        self,
        calendar_id: str,
        credentials: dict[str, Any],
        default_duration_minutes: int = 30,
        business_hours_only: bool = True,
    ):
        """Initialize Google Calendar adapter.

        Args:
            calendar_id: Calendar ID (e.g., "primary")
            credentials: OAuth credentials dict with access_token, refresh_token, etc.
            default_duration_minutes: Default appointment duration
            business_hours_only: Whether to enforce business hours
        """
        self.calendar_id = calendar_id
        self.default_duration_minutes = default_duration_minutes
        self.business_hours_only = business_hours_only
        self._credentials = self._load_credentials(credentials)
        self._service = None

    def _load_credentials(self, credentials_dict: dict[str, Any]) -> Credentials:
        """Load OAuth credentials from dictionary.

        Args:
            credentials_dict: Dictionary with token info

        Returns:
            Google Credentials object
        """
        return Credentials(
            token=credentials_dict.get("access_token"),
            refresh_token=credentials_dict.get("refresh_token"),
            token_uri="https://oauth2.googleapis.com/token",
            client_id=credentials_dict.get("client_id"),
            client_secret=credentials_dict.get("client_secret"),
            scopes=self.SCOPES,
        )

    def _get_service(self):
        """Get or create Google Calendar API service.

        Returns:
            Google Calendar API service instance
        """
        if self._service is None:
            # Refresh token if needed
            if self._credentials.expired and self._credentials.refresh_token:
                try:
                    self._credentials.refresh(Request())
                except Exception as e:
                    logger.error("Failed to refresh Google Calendar token: %s", e)
                    raise

            self._service = build("calendar", "v3", credentials=self._credentials)
        return self._service

    def get_capabilities(self) -> dict[str, bool]:
        """Get calendar capabilities."""
        return {
            CalendarCapabilities.READ_AVAILABILITY: True,
            CalendarCapabilities.READ_APPOINTMENTS: True,
            CalendarCapabilities.CREATE_APPOINTMENTS: True,
        }

    async def check_availability(
        self, start: datetime, end: datetime, duration_minutes: int = 30
    ) -> list[dict[str, Any]]:
        """Find available time slots.

        Args:
            start: Start of date range
            end: End of date range
            duration_minutes: Duration of slots to find

        Returns:
            List of available time slots
        """
        try:
            service = self._get_service()

            # Get existing events in the time range
            events_result = (
                service.events()
                .list(
                    calendarId=self.calendar_id,
                    timeMin=start.isoformat() + "Z",
                    timeMax=end.isoformat() + "Z",
                    singleEvents=True,
                    orderBy="startTime",
                )
                .execute()
            )

            events = events_result.get("items", [])

            # Build list of busy times
            busy_periods: list[tuple[datetime, datetime]] = []
            for event in events:
                event_start = datetime.fromisoformat(
                    event["start"].get("dateTime", event["start"].get("date") + "T00:00:00")
                ).replace(tzinfo=None)
                event_end = datetime.fromisoformat(
                    event["end"].get("dateTime", event["end"].get("date") + "T00:00:00")
                ).replace(tzinfo=None)
                busy_periods.append((event_start, event_end))

            # Find available slots (simplified: 30-minute slots during business hours)
            available_slots: list[dict[str, Any]] = []
            current = start.replace(minute=0, second=0, microsecond=0)

            # Default business hours: 9 AM - 5 PM
            business_start_hour = 9
            business_end_hour = 17

            while current < end:
                # Check if within business hours
                if self.business_hours_only:
                    if current.hour < business_start_hour or current.hour >= business_end_hour:
                        current += timedelta(hours=1)
                        continue

                slot_end = current + timedelta(minutes=duration_minutes)

                # Check if slot conflicts with existing events
                is_available = True
                for busy_start, busy_end in busy_periods:
                    if not (slot_end <= busy_start or current >= busy_end):
                        is_available = False
                        break

                if is_available:
                    available_slots.append(
                        {
                            "start": current.isoformat(),
                            "end": slot_end.isoformat(),
                            "duration_minutes": duration_minutes,
                        }
                    )

                current += timedelta(minutes=30)  # Check every 30 minutes

            return available_slots

        except HttpError as e:
            logger.error("Google Calendar API error: %s", e)
            return []
        except Exception as e:
            logger.exception("Error checking availability: %s", e)
            return []

    async def create_appointment(self, appointment: AppointmentData) -> dict[str, Any]:
        """Create a new appointment.

        Args:
            appointment: Appointment data

        Returns:
            Result dictionary with success status and appointment ID or error
        """
        try:
            service = self._get_service()

            # Build event
            event = {
                "summary": appointment.summary,
                "start": {
                    "dateTime": appointment.start_time.isoformat(),
                    "timeZone": "UTC",
                },
                "end": {
                    "dateTime": appointment.end_time.isoformat(),
                    "timeZone": "UTC",
                },
            }

            if appointment.description:
                event["description"] = appointment.description

            # Create event
            created_event = (
                service.events().insert(calendarId=self.calendar_id, body=event).execute()
            )

            return {
                "success": True,
                "appointment_id": created_event.get("id"),
                "html_link": created_event.get("htmlLink"),
            }

        except HttpError as e:
            error_msg = f"Google Calendar API error: {e}"
            logger.error(error_msg)
            return {"success": False, "error": error_msg}
        except Exception as e:
            error_msg = f"Error creating appointment: {e}"
            logger.exception(error_msg)
            return {"success": False, "error": error_msg}

    async def get_appointments(self, start: datetime, end: datetime) -> list[dict[str, Any]]:
        """Get existing appointments in date range.

        Args:
            start: Start of date range
            end: End of date range

        Returns:
            List of appointments
        """
        try:
            service = self._get_service()

            events_result = (
                service.events()
                .list(
                    calendarId=self.calendar_id,
                    timeMin=start.isoformat() + "Z",
                    timeMax=end.isoformat() + "Z",
                    singleEvents=True,
                    orderBy="startTime",
                )
                .execute()
            )

            events = events_result.get("items", [])
            appointments = []

            for event in events:
                event_start = event["start"].get(
                    "dateTime", event["start"].get("date") + "T00:00:00"
                )
                event_end = event["end"].get("dateTime", event["end"].get("date") + "T00:00:00")

                appointments.append(
                    {
                        "id": event.get("id"),
                        "start": event_start,
                        "end": event_end,
                        "summary": event.get("summary", "No title"),
                    }
                )

            return appointments

        except HttpError as e:
            logger.error("Google Calendar API error: %s", e)
            return []
        except Exception as e:
            logger.exception("Error getting appointments: %s", e)
            return []
