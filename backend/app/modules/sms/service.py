"""SMS service for sending call summaries to customers."""

import logging
from typing import Any

from twilio.rest import Client  # type: ignore[import-untyped]

from app.config import get_settings
from app.modules.calls.models import CallIntent, CallLog, CallOutcome
from app.modules.shops.models import ShopConfig
from app.modules.sms.models import SmsOptOut
from app.modules.shops.service import normalize_phone

logger = logging.getLogger(__name__)
_settings = get_settings()


class SmsService:
    """Service for sending SMS messages via Twilio."""

    def __init__(self) -> None:
        """Initialize Twilio client."""
        if _settings.twilio_account_sid and _settings.twilio_auth_token:
            self.client = Client(
                _settings.twilio_account_sid, _settings.twilio_auth_token
            )
        else:
            self.client = None
            logger.warning("Twilio credentials not configured, SMS will be disabled")

    async def is_opted_out(self, phone_number: str, shop_id: str) -> bool:
        """Check if a phone number has opted out of SMS.

        Args:
            phone_number: Customer phone number (E.164 format)
            shop_id: Shop ID

        Returns:
            True if opted out, False otherwise
        """
        normalized = normalize_phone(phone_number)
        opt_out = await SmsOptOut.find_one(
            {"phone_number": normalized, "shop_id": shop_id}
        )
        return opt_out is not None

    def generate_call_summary(
        self, call_log: CallLog, shop_config: ShopConfig
    ) -> str:
        """Generate a brief, customer-friendly SMS summary of the call.

        Args:
            call_log: The call log with intent, outcome, and tool results
            shop_config: Shop configuration for shop name

        Returns:
            SMS message text
        """
        shop_name = shop_config.name
        intent = call_log.intent
        tool_results = call_log.tool_results

        # Generate summary based on intent
        if intent == CallIntent.CHECK_STATUS:
            return self._generate_status_summary(tool_results, shop_name)
        elif intent == CallIntent.GET_HOURS:
            return self._generate_hours_summary(tool_results, shop_name)
        elif intent == CallIntent.GET_LOCATION:
            return self._generate_location_summary(tool_results, shop_name)
        elif intent == CallIntent.GET_SERVICES:
            return self._generate_services_summary(tool_results, shop_name)
        else:
            # Generic fallback
            return f"Thanks for calling {shop_name}! We're here to help."

    def _generate_status_summary(
        self, tool_results: dict[str, Any], shop_name: str
    ) -> str:
        """Generate detailed status summary from tool results."""
        if not tool_results.get("success"):
            return f"Thanks for calling {shop_name}! We'll update you when your vehicle is ready."

        # Check for work order status (direct status lookup)
        status = tool_results.get("status", "").upper()
        if status:
            return self._format_detailed_status(tool_results, shop_name, status)

        # Check for work orders list
        work_orders = tool_results.get("work_orders", [])
        if work_orders and isinstance(work_orders, list):
            # Get first work order (most recent/active)
            first_order = work_orders[0] if isinstance(work_orders[0], dict) else {}
            order_status = first_order.get("status", "").upper()
            return self._format_detailed_status(first_order, shop_name, order_status)

        # Default status message
        return f"Your vehicle status: In progress. We'll update you when it's ready. Thanks for calling {shop_name}!"

    def _format_detailed_status(
        self, order_data: dict[str, Any], shop_name: str, status: str
    ) -> str:
        """Format detailed work order status with vehicle and service info."""
        # Extract vehicle info
        vehicle = order_data.get("vehicle", {})
        vehicle_info = ""
        if isinstance(vehicle, dict):
            year = vehicle.get("year")
            make = vehicle.get("make", "")
            model = vehicle.get("model", "")
            if year and make and model:
                vehicle_info = f"Your {year} {make} {model}"

        # Extract work order ID
        order_id = order_data.get("order_id", "")

        # Handle different statuses
        if status in ["READY", "COMPLETE", "FINISHED"]:
            msg = f"Hi! {vehicle_info} is ready for pickup" if vehicle_info else "Hi! Your vehicle is ready for pickup"
            if order_id:
                msg += f" (Order {order_id})"
            msg += f". Thanks for calling {shop_name}!"
            return msg

        elif status == "WAITING_PARTS":
            msg = f"{vehicle_info} is waiting for parts" if vehicle_info else "Your vehicle is waiting for parts"
            notes = order_data.get("notes", "")
            if notes:
                msg += f". {notes}"
            msg += f". We'll update you when parts arrive. Thanks for calling {shop_name}!"
            return msg

        elif status == "IN_PROGRESS":
            # Include service details
            services = order_data.get("services", [])
            completed_services = []
            in_progress_services = []
            
            if isinstance(services, list):
                for svc in services:
                    if isinstance(svc, dict):
                        svc_name = svc.get("name", "")
                        svc_status = svc.get("status", "").upper()
                        if svc_status == "COMPLETED":
                            completed_services.append(svc_name)
                        elif svc_status == "IN_PROGRESS":
                            in_progress_services.append(svc_name)

            msg_parts = []
            if vehicle_info:
                msg_parts.append(f"{vehicle_info}")
            
            if completed_services:
                msg_parts.append(f"Completed: {', '.join(completed_services[:2])}")
            if in_progress_services:
                msg_parts.append(f"In progress: {', '.join(in_progress_services[:2])}")

            # Add estimated completion
            est_completion = order_data.get("estimated_completion")
            if est_completion:
                try:
                    from datetime import datetime
                    est_dt = datetime.fromisoformat(est_completion.replace("Z", "+00:00"))
                    est_time = est_dt.strftime("%I:%M %p")
                    msg_parts.append(f"Est. ready: {est_time}")
                except Exception:
                    pass

            if msg_parts:
                msg = ". ".join(msg_parts) + f". Thanks for calling {shop_name}!"
            else:
                msg = f"{vehicle_info} is in progress" if vehicle_info else "Your vehicle is in progress"
                msg += f". We'll update you when it's ready. Thanks for calling {shop_name}!"
            return msg

        else:
            # PENDING or other status
            msg = f"{vehicle_info} status: {status.replace('_', ' ').title()}" if vehicle_info else f"Status: {status.replace('_', ' ').title()}"
            notes = order_data.get("notes", "")
            if notes:
                msg += f". {notes}"
            msg += f". Thanks for calling {shop_name}!"
            return msg

    def _generate_hours_summary(
        self, tool_results: dict[str, Any], shop_name: str
    ) -> str:
        """Generate business hours summary."""
        hours = tool_results.get("hours", {})
        if isinstance(hours, dict):
            # Format hours nicely
            hours_str = self._format_hours(hours)
            return f"We're open {hours_str}. Thanks for calling {shop_name}!"
        return f"Thanks for calling {shop_name}! We're here to help."

    def _format_hours(self, hours: dict[str, Any]) -> str:
        """Format business hours dict into readable string."""
        # Handle structured format (monday, tuesday, etc.)
        if "monday" in hours or "mon" in hours:
            day_map = {
                "monday": "Mon", "tuesday": "Tue", "wednesday": "Wed",
                "thursday": "Thu", "friday": "Fri", "saturday": "Sat", "sunday": "Sun"
            }
            short_map = {"mon": "Mon", "tue": "Tue", "wed": "Wed", "thu": "Thu", 
                        "fri": "Fri", "sat": "Sat", "sun": "Sun"}
            
            formatted_days = []
            for day_key, day_label in {**day_map, **short_map}.items():
                day_hours = hours.get(day_key, {})
                if isinstance(day_hours, dict):
                    if day_hours.get("closed"):
                        continue
                    open_time = day_hours.get("open")
                    close_time = day_hours.get("close")
                    if open_time and close_time:
                        formatted_days.append(f"{day_label} {open_time}-{close_time}")
            
            if formatted_days:
                # Group consecutive days with same hours
                if len(formatted_days) >= 5:
                    # Check if Mon-Fri are same
                    mon_fri_same = all(
                        hours.get("monday", {}).get("open") == hours.get("friday", {}).get("open") if "monday" in hours else
                        hours.get("mon", {}).get("open") == hours.get("fri", {}).get("open")
                    )
                    if mon_fri_same:
                        mon_hours = formatted_days[0].split(" ", 1)[1] if formatted_days else ""
                        result = f"Mon-Fri {mon_hours}"
                        if len(formatted_days) > 5:
                            result += f", {formatted_days[5]}"
                        if len(formatted_days) > 6:
                            result += f", {formatted_days[6]}"
                        return result
                return ", ".join(formatted_days)
        
        return "Mon-Fri 8am-6pm, Sat 9am-2pm"  # Fallback

    def _generate_location_summary(
        self, tool_results: dict[str, Any], shop_name: str
    ) -> str:
        """Generate detailed location summary."""
        location = tool_results.get("location", {})
        if isinstance(location, dict):
            address = location.get("address") or location.get("street")
            city = location.get("city")
            state = location.get("state")
            zip_code = location.get("zip_code")
            directions = location.get("directions")
            
            if address:
                parts = [address]
                if city:
                    parts.append(city)
                if state:
                    parts.append(state)
                if zip_code:
                    parts.append(zip_code)
                addr_str = ", ".join(parts)
                
                msg = f"We're at {addr_str}"
                if directions:
                    msg += f". {directions}"
                msg += f". Thanks for calling {shop_name}!"
                return msg
        return f"Thanks for calling {shop_name}! We're here to help."

    def _generate_services_summary(
        self, tool_results: dict[str, Any], shop_name: str
    ) -> str:
        """Generate detailed services summary."""
        services = tool_results.get("services", [])
        if isinstance(services, list) and services:
            # List more services (up to 5 for better detail)
            service_names = [
                s.get("name", s) if isinstance(s, dict) else str(s)
                for s in services[:5]
            ]
            services_str = ", ".join(service_names)
            if len(services) > 5:
                return f"We offer: {services_str}, and more. Call us anytime! Thanks for calling {shop_name}!"
            else:
                return f"We offer: {services_str}. Call us anytime! Thanks for calling {shop_name}!"
        return f"Thanks for calling {shop_name}! We offer a full range of auto repair services. Call us anytime!"

    async def send_sms(
        self,
        to_number: str,
        message: str,
        from_number: str | None = None,
    ) -> bool:
        """Send an SMS message via Twilio.

        Args:
            to_number: Recipient phone number (E.164 format)
            message: Message text
            from_number: Sender phone number (defaults to configured Twilio number)

        Returns:
            True if sent successfully, False otherwise
        """
        if not self.client:
            logger.warning("Twilio client not initialized, cannot send SMS")
            return False

        try:
            normalized_to = normalize_phone(to_number)
            from_num = from_number or _settings.twilio_phone_number

            if not from_num:
                logger.error("No Twilio phone number configured for SMS")
                return False

            # Send SMS
            twilio_message = self.client.messages.create(
                body=message,
                from_=from_num,
                to=normalized_to,
            )

            logger.info(
                "SMS sent successfully: sid=%s, to=%s",
                twilio_message.sid,
                normalized_to,
            )
            return True

        except Exception as e:
            logger.exception("Failed to send SMS to %s: %s", to_number, e)
            return False

    async def send_call_summary(
        self,
        call_log: CallLog,
        shop_config: ShopConfig,
        from_number: str | None = None,
    ) -> bool:
        """Send a call summary SMS to the customer.

        Args:
            call_log: The call log
            shop_config: Shop configuration
            from_number: Optional sender phone number override

        Returns:
            True if sent successfully, False otherwise
        """
        # Check if customer has opted out
        if call_log.caller_number and call_log.shop_id:
            is_opted_out = await self.is_opted_out(
                call_log.caller_number, call_log.shop_id
            )
            if is_opted_out:
                logger.info(
                    "Skipping SMS to %s (opted out)", call_log.caller_number
                )
                return False

        # Generate summary
        summary = self.generate_call_summary(call_log, shop_config)

        # Add opt-out instruction
        summary += " Reply STOP to opt out."

        # Send SMS
        if call_log.caller_number:
            return await self.send_sms(
                call_log.caller_number, summary, from_number
            )

        return False

