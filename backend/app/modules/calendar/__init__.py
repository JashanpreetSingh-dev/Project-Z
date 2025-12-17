"""Calendar integration module for appointment booking."""

from app.modules.calendar.service import get_calendar_adapter, validate_booking_permission

__all__ = ["get_calendar_adapter", "validate_booking_permission"]
