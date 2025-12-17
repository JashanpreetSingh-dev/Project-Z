"""Tool registry for MCP-style LLM function calling.

This module provides the interface between the LLM and the shop system adapters.
Each tool maps to an adapter method that fetches data from the shop's system.
"""

import logging
from datetime import datetime, timedelta
from typing import Any

from app.adapters.base import ShopSystemAdapter
from app.adapters.calendar.base import CalendarAdapter
from app.modules.calendar.service import validate_booking_permission
from app.modules.shops.models import ShopConfig
from app.modules.voice.booking_state import BookingState

logger = logging.getLogger(__name__)

# OpenAI function calling schema for each tool
TOOL_SCHEMAS: list[dict[str, Any]] = [
    {
        "type": "function",
        "function": {
            "name": "lookup_work_order",
            "description": "Look up the status of a customer's vehicle or work order. Use this when a caller asks about their car, vehicle status, or repair progress.",
            "parameters": {
                "type": "object",
                "properties": {
                    "customer_name": {
                        "type": "string",
                        "description": "The customer's full name (e.g., 'John Smith')",
                    },
                    "last_name": {
                        "type": "string",
                        "description": "The customer's last name only (e.g., 'Smith')",
                    },
                    "license_plate": {
                        "type": "string",
                        "description": "The vehicle's license plate number",
                    },
                    "phone": {
                        "type": "string",
                        "description": "The customer's phone number",
                    },
                },
                "required": [],
            },
        },
    },
    {
        "type": "function",
        "function": {
            "name": "get_work_order_status",
            "description": "Get detailed status of a specific work order by its ID.",
            "parameters": {
                "type": "object",
                "properties": {
                    "order_id": {
                        "type": "string",
                        "description": "The work order ID (e.g., 'WO-2024-001')",
                    },
                },
                "required": ["order_id"],
            },
        },
    },
    {
        "type": "function",
        "function": {
            "name": "get_business_hours",
            "description": "Get the shop's business hours. Use this when a caller asks what time you open, close, or your hours of operation.",
            "parameters": {
                "type": "object",
                "properties": {},
                "required": [],
            },
        },
    },
    {
        "type": "function",
        "function": {
            "name": "get_location",
            "description": "Get the shop's address and location. Use this when a caller asks where you are located or for directions.",
            "parameters": {
                "type": "object",
                "properties": {},
                "required": [],
            },
        },
    },
    {
        "type": "function",
        "function": {
            "name": "list_services",
            "description": "Get a list of services offered by the shop. Use this when a caller asks what services you provide or if you do a specific type of repair.",
            "parameters": {
                "type": "object",
                "properties": {},
                "required": [],
            },
        },
    },
    {
        "type": "function",
        "function": {
            "name": "get_customer_vehicles",
            "description": "Look up vehicles associated with a customer by their phone number or name.",
            "parameters": {
                "type": "object",
                "properties": {
                    "phone": {
                        "type": "string",
                        "description": "The customer's phone number",
                    },
                    "customer_name": {
                        "type": "string",
                        "description": "The customer's name",
                    },
                },
                "required": [],
            },
        },
    },
    {
        "type": "function",
        "function": {
            "name": "transfer_to_human",
            "description": "Transfer the call to a human. Use this when the caller explicitly asks to speak with a person, or when you cannot help them.",
            "parameters": {
                "type": "object",
                "properties": {
                    "reason": {
                        "type": "string",
                        "description": "Brief reason for the transfer",
                    },
                },
                "required": ["reason"],
            },
        },
    },
    {
        "type": "function",
        "function": {
            "name": "check_availability",
            "description": "Check available appointment slots for a specific date. Use this when a caller asks about availability or wants to book an appointment.",
            "parameters": {
                "type": "object",
                "properties": {
                    "date": {
                        "type": "string",
                        "description": "Date to check availability (ISO date string, e.g., '2025-01-16')",
                    },
                    "duration_minutes": {
                        "type": "integer",
                        "description": "Duration of appointment in minutes (default: 30)",
                        "default": 30,
                    },
                },
                "required": ["date"],
            },
        },
    },
    {
        "type": "function",
        "function": {
            "name": "propose_appointment",
            "description": "Propose a specific appointment time to the customer. Use this after checking availability. This does NOT create the appointment - it only stores the proposal.",
            "parameters": {
                "type": "object",
                "properties": {
                    "date": {
                        "type": "string",
                        "description": "Date of the appointment (ISO date string, e.g., '2025-01-16')",
                    },
                    "time": {
                        "type": "string",
                        "description": "Time of the appointment (ISO time string, e.g., '15:00:00' or '15:00')",
                    },
                    "duration_minutes": {
                        "type": "integer",
                        "description": "Duration of appointment in minutes (default: 30)",
                        "default": 30,
                    },
                },
                "required": ["date", "time"],
            },
        },
    },
    {
        "type": "function",
        "function": {
            "name": "confirm_appointment",
            "description": "Create an appointment after the customer has explicitly confirmed. ONLY use this after proposing an appointment and receiving clear confirmation (yes, that works, okay). Do NOT use if the customer's response is unclear or negative.",
            "parameters": {
                "type": "object",
                "properties": {
                    "date": {
                        "type": "string",
                        "description": "Date of the appointment (ISO date string, e.g., '2025-01-16')",
                    },
                    "time": {
                        "type": "string",
                        "description": "Time of the appointment (ISO time string, e.g., '15:00:00' or '15:00')",
                    },
                    "customer_name": {
                        "type": "string",
                        "description": "Customer's name (optional)",
                    },
                    "phone": {
                        "type": "string",
                        "description": "Customer's phone number (optional)",
                    },
                },
                "required": ["date", "time"],
            },
        },
    },
]


class ToolRegistry:
    """MCP-style tool registry for LLM function calling.

    This class bridges the LLM's function calls to the shop system adapter.
    It provides the OpenAI function schema and dispatches tool calls to
    the appropriate adapter methods.
    """

    def __init__(
        self,
        adapter: ShopSystemAdapter,
        calendar_adapter: CalendarAdapter | None = None,
        booking_state: BookingState | None = None,
        shop_config: ShopConfig | None = None,
        caller_phone: str | None = None,
    ):
        """Initialize tool registry with adapters and state.

        Args:
            adapter: The shop system adapter for fetching shop data.
            calendar_adapter: Optional calendar adapter for appointment booking.
            booking_state: Optional booking state for tracking proposals.
            shop_config: Optional shop config for permission checks.
        """
        self.adapter = adapter
        self.calendar_adapter = calendar_adapter
        self.booking_state = booking_state
        self.shop_config = shop_config
        # For phone-based sessions (e.g. Twilio), this is the caller's number.
        # Used as a safe default when creating appointments so the AI
        # doesn't need to ask for the phone number again.
        self.caller_phone = caller_phone
        self._booking_attempts: list[dict[str, Any]] = []

    def get_tools_schema(self) -> list[dict[str, Any]]:
        """Get the OpenAI function calling schema for all tools.

        Returns:
            List of tool definitions in OpenAI function calling format.
        """
        return TOOL_SCHEMAS

    def get_realtime_tools_schema(self) -> list[dict[str, Any]]:
        """Get tools schema in OpenAI Realtime API format.

        The Realtime API uses a slightly different format than Chat Completions.

        Returns:
            List of tool definitions in Realtime API format.
        """
        return [
            {
                "type": "function",
                "name": tool["function"]["name"],
                "description": tool["function"]["description"],
                "parameters": tool["function"]["parameters"],
            }
            for tool in TOOL_SCHEMAS
        ]

    async def execute(self, tool_name: str, args: dict[str, Any]) -> dict[str, Any]:
        """Execute a tool call from the LLM.

        Args:
            tool_name: Name of the tool to execute
            args: Arguments passed by the LLM

        Returns:
            Result from the tool execution
        """
        # Log booking tool calls at entry point
        if tool_name in ["check_availability", "propose_appointment", "confirm_appointment"]:
            logger.info(
                "🔧 TOOL EXECUTION: %s called - Args: %s, Shop: %s, Caller: %s",
                tool_name,
                {k: v for k, v in args.items() if k != "phone"},  # Don't log full phone for privacy
                self.shop_config.id if self.shop_config else "unknown",
                self.caller_phone or "unknown",
            )

        try:
            if tool_name == "lookup_work_order":
                results = await self.adapter.lookup_work_order(
                    customer_name=args.get("customer_name"),
                    license_plate=args.get("license_plate"),
                    phone=args.get("phone"),
                    last_name=args.get("last_name"),
                )
                if not results:
                    return {
                        "success": False,
                        "message": "No work orders found matching the provided information.",
                    }
                return {"success": True, "work_orders": results}

            elif tool_name == "get_work_order_status":
                result = await self.adapter.get_work_order_status(args["order_id"])
                return {"success": True, **result}

            elif tool_name == "get_business_hours":
                hours = await self.adapter.get_business_hours()
                return {"success": True, "hours": hours}

            elif tool_name == "get_location":
                location = await self.adapter.get_location()
                return {"success": True, "location": location}

            elif tool_name == "list_services":
                services = await self.adapter.list_services()
                return {"success": True, "services": services}

            elif tool_name == "get_customer_vehicles":
                vehicles = await self.adapter.get_customer_vehicles(
                    phone=args.get("phone"),
                    customer_name=args.get("customer_name"),
                )
                if not vehicles:
                    return {
                        "success": False,
                        "message": "No vehicles found for this customer.",
                    }
                return {"success": True, "vehicles": vehicles}

            elif tool_name == "transfer_to_human":
                # This is handled specially by the voice service
                return {
                    "success": True,
                    "action": "transfer",
                    "reason": args.get("reason", "Customer requested transfer"),
                }

            # Calendar booking tools
            elif tool_name == "check_availability":
                return await self._handle_check_availability(args)

            elif tool_name == "propose_appointment":
                return await self._handle_propose_appointment(args)

            elif tool_name == "confirm_appointment":
                return await self._handle_confirm_appointment(args)

            else:
                return {"success": False, "error": f"Unknown tool: {tool_name}"}

        except Exception as e:
            return {"success": False, "error": str(e)}

    async def _handle_check_availability(self, args: dict[str, Any]) -> dict[str, Any]:
        """Handle check_availability tool call."""
        from app.common.utils import utc_now

        attempt = {
            "tool_name": "check_availability",
            "timestamp": utc_now().isoformat(),
            "slot_proposed": None,
            "confirmation_received": False,
            "write_success": False,
        }

        try:
            date_str = args.get("date")
            duration_minutes = args.get("duration_minutes", 30)

            logger.info(
                "📅 BOOKING ATTEMPT: Checking availability - Date: %s, Duration: %d min, Shop: %s, Caller: %s",
                date_str,
                duration_minutes,
                self.shop_config.id if self.shop_config else "unknown",
                self.caller_phone or "unknown",
            )

            if not self.calendar_adapter:
                attempt["error"] = "Calendar integration not configured"
                self._booking_attempts.append(attempt)
                logger.warning(
                    "⚠️ BOOKING FAILED: Calendar integration not configured for shop %s",
                    self.shop_config.id if self.shop_config else "unknown",
                )
                return {
                    "success": False,
                    "message": "Appointment booking is not available. I can transfer you to speak with someone who can help schedule an appointment.",
                }

            if not date_str:
                attempt["error"] = "Date not provided"
                self._booking_attempts.append(attempt)
                logger.warning("⚠️ BOOKING FAILED: Date not provided in check_availability request")
                return {"success": False, "error": "Date is required"}

            # Parse date and create time range (check full day)
            try:
                check_date = datetime.fromisoformat(date_str).date()
                start = datetime.combine(check_date, datetime.min.time())
                end = datetime.combine(check_date, datetime.max.time())
            except ValueError:
                attempt["error"] = "Invalid date format"
                self._booking_attempts.append(attempt)
                logger.warning("⚠️ BOOKING FAILED: Invalid date format: %s", date_str)
                return {
                    "success": False,
                    "error": "Invalid date format. Use ISO format (YYYY-MM-DD)",
                }

            # Check availability
            slots = await self.calendar_adapter.check_availability(start, end, duration_minutes)

            attempt["write_success"] = True
            self._booking_attempts.append(attempt)

            logger.info(
                "✅ BOOKING SUCCESS: Found %d available slots on %s",
                len(slots),
                date_str,
            )

            return {
                "success": True,
                "date": date_str,
                "available_slots": slots,
                "message": f"I found {len(slots)} available time slots on {date_str}.",
            }

        except Exception as e:
            attempt["error"] = str(e)
            self._booking_attempts.append(attempt)
            logger.exception(
                "❌ BOOKING ERROR: Exception while checking availability - Date: %s, Error: %s",
                args.get("date"),
                str(e),
            )
            return {"success": False, "error": f"Error checking availability: {e}"}

    async def _handle_propose_appointment(self, args: dict[str, Any]) -> dict[str, Any]:
        """Handle propose_appointment tool call."""
        from app.common.utils import utc_now

        attempt = {
            "tool_name": "propose_appointment",
            "timestamp": utc_now().isoformat(),
            "confirmation_received": False,
            "write_success": False,
        }

        try:
            date_str = args.get("date")
            time_str = args.get("time")
            duration_minutes = args.get("duration_minutes", 30)

            logger.info(
                "💡 BOOKING PROPOSAL: Proposing appointment - Date: %s, Time: %s, Duration: %d min, Shop: %s, Caller: %s",
                date_str,
                time_str,
                duration_minutes,
                self.shop_config.id if self.shop_config else "unknown",
                self.caller_phone or "unknown",
            )

            if not self.booking_state:
                attempt["error"] = "Booking state not available"
                self._booking_attempts.append(attempt)
                logger.error("❌ BOOKING ERROR: Booking state not initialized")
                return {"success": False, "error": "Booking state not initialized"}

            if not date_str or not time_str:
                attempt["error"] = "Date or time not provided"
                self._booking_attempts.append(attempt)
                logger.warning("⚠️ BOOKING FAILED: Date or time not provided in proposal")
                return {"success": False, "error": "Date and time are required"}

            # Store proposal
            self.booking_state.propose(date_str, time_str, duration_minutes)

            attempt["slot_proposed"] = f"{date_str} {time_str}"
            attempt["write_success"] = True
            self._booking_attempts.append(attempt)

            logger.info(
                "✅ BOOKING PROPOSAL: Successfully proposed appointment for %s at %s",
                date_str,
                time_str,
            )

            return {
                "success": True,
                "message": f"Proposed appointment: {date_str} at {time_str}",
                "date": date_str,
                "time": time_str,
                "duration_minutes": duration_minutes,
            }

        except Exception as e:
            attempt["error"] = str(e)
            self._booking_attempts.append(attempt)
            logger.exception(
                "❌ BOOKING ERROR: Exception while proposing appointment - Date: %s, Time: %s, Error: %s",
                args.get("date"),
                args.get("time"),
                str(e),
            )
            return {"success": False, "error": f"Error proposing appointment: {e}"}

    async def _handle_confirm_appointment(self, args: dict[str, Any]) -> dict[str, Any]:
        """Handle confirm_appointment tool call (write operation - guarded)."""
        from app.adapters.calendar.base import AppointmentData
        from app.common.utils import utc_now

        attempt = {
            "tool_name": "confirm_appointment",
            "timestamp": utc_now().isoformat(),
            "confirmation_received": False,
            "write_success": False,
        }

        try:
            date_str = args.get("date")
            time_str = args.get("time")
            customer_name = args.get("customer_name")
            phone = args.get("phone") or getattr(self, "caller_phone", None)

            logger.info(
                "🔒 BOOKING CONFIRMATION: Attempting to confirm appointment - Date: %s, Time: %s, Customer: %s, Phone: %s, Shop: %s",
                date_str,
                time_str,
                customer_name or "unknown",
                phone or "unknown",
                self.shop_config.id if self.shop_config else "unknown",
            )

            # Permission check: Only execute if booking is enabled
            if not self.shop_config or not validate_booking_permission(self.shop_config):
                attempt["error"] = "Booking not enabled or not configured"
                self._booking_attempts.append(attempt)
                logger.warning(
                    "⚠️ BOOKING FAILED: Booking not enabled or not configured for shop %s",
                    self.shop_config.id if self.shop_config else "unknown",
                )
                return {
                    "success": False,
                    "message": "Appointment booking is not currently enabled. I can transfer you to speak with someone who can help schedule an appointment.",
                }

            # Calendar adapter check
            if not self.calendar_adapter:
                attempt["error"] = "Calendar adapter not available"
                self._booking_attempts.append(attempt)
                logger.warning(
                    "⚠️ BOOKING FAILED: Calendar adapter not available for shop %s",
                    self.shop_config.id if self.shop_config else "unknown",
                )
                return {
                    "success": False,
                    "message": "Calendar integration is not configured. I can transfer you to speak with someone who can help schedule an appointment.",
                }

            # Booking state check
            if not self.booking_state:
                attempt["error"] = "Booking state not available"
                self._booking_attempts.append(attempt)
                logger.error("❌ BOOKING ERROR: Booking state not initialized")
                return {"success": False, "error": "Booking state not initialized"}

            if not date_str or not time_str:
                attempt["error"] = "Date or time not provided"
                self._booking_attempts.append(attempt)
                logger.warning("⚠️ BOOKING FAILED: Date or time not provided in confirmation")
                return {"success": False, "error": "Date and time are required"}

            # Verify confirmation: Check that this matches the proposed appointment
            if not self.booking_state.verify_confirmation(date_str, time_str):
                attempt["error"] = "Confirmation mismatch - proposed appointment does not match"
                self._booking_attempts.append(attempt)
                logger.warning(
                    "⚠️ BOOKING FAILED: Confirmation mismatch - proposed: %s %s, confirmed: %s %s",
                    self.booking_state.proposed_date if self.booking_state else "none",
                    self.booking_state.proposed_time if self.booking_state else "none",
                    date_str,
                    time_str,
                )
                return {
                    "success": False,
                    "error": "The appointment details don't match what was proposed. Please propose the appointment first.",
                }

            # Parse datetime
            try:
                # Combine date and time
                datetime_str = f"{date_str}T{time_str}"
                if ":" not in time_str or time_str.count(":") == 1:
                    # Add seconds if missing
                    datetime_str = f"{date_str}T{time_str}:00"

                start_time = datetime.fromisoformat(datetime_str)
            except ValueError:
                attempt["error"] = "Invalid date/time format"
                self._booking_attempts.append(attempt)
                logger.warning(
                    "⚠️ BOOKING FAILED: Invalid date/time format - Date: %s, Time: %s",
                    date_str,
                    time_str,
                )
                return {"success": False, "error": "Invalid date or time format"}

            # Get duration from proposal or use default
            duration_minutes = (
                self.booking_state.proposed_duration_minutes
                or self.shop_config.settings.calendar_settings.default_duration_minutes
            )
            end_time = start_time + timedelta(minutes=duration_minutes)

            # Create appointment
            appointment = AppointmentData(
                calendar_id=self.shop_config.settings.calendar_settings.calendar_id,
                start_time=start_time,
                end_time=end_time,
                summary="Customer appointment",
                source="ai_voice",
                caller_phone=phone,
                description=f"Appointment booked via AI voice call. Customer: {customer_name or 'Not provided'}",
            )

            logger.info(
                "📝 BOOKING WRITE: Creating appointment in calendar - Calendar ID: %s, Start: %s, End: %s, Duration: %d min",
                appointment.calendar_id,
                start_time.isoformat(),
                end_time.isoformat(),
                duration_minutes,
            )

            result = await self.calendar_adapter.create_appointment(appointment)

            if result.get("success"):
                attempt["confirmation_received"] = True
                attempt["write_success"] = True
                attempt["slot_proposed"] = f"{date_str} {time_str}"
                self.booking_state.mark_confirmed()
                appointment_id = result.get("appointment_id", "unknown")
                logger.info(
                    "✅ BOOKING SUCCESS: Appointment created successfully - ID: %s, Date: %s, Time: %s, Customer: %s",
                    appointment_id,
                    date_str,
                    time_str,
                    customer_name or "unknown",
                )
            else:
                attempt["error"] = result.get("error", "Unknown error")
                attempt["confirmation_received"] = True  # Customer did confirm, but write failed
                logger.error(
                    "❌ BOOKING FAILED: Failed to create appointment in calendar - Date: %s, Time: %s, Error: %s",
                    date_str,
                    time_str,
                    result.get("error", "Unknown error"),
                )

            self._booking_attempts.append(attempt)

            return result

        except Exception as e:
            attempt["error"] = str(e)
            self._booking_attempts.append(attempt)
            logger.exception(
                "❌ BOOKING ERROR: Exception while confirming appointment - Date: %s, Time: %s, Error: %s",
                args.get("date"),
                args.get("time"),
                str(e),
            )
            return {"success": False, "error": f"Error confirming appointment: {e}"}

    def get_booking_attempts(self) -> list[dict[str, Any]]:
        """Get all booking attempts for logging."""
        return self._booking_attempts.copy()
