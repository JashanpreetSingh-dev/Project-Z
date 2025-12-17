"""Service for managing customer context."""

import logging
from typing import Any

from app.modules.calls.models import CallLog
from app.modules.context.models import CustomerContext, InteractionRecord
from app.modules.shops.service import normalize_phone

logger = logging.getLogger(__name__)


async def get_customer_context(phone_number: str, shop_id: str) -> CustomerContext | None:
    """Get customer context by phone number and shop ID.

    Args:
        phone_number: Customer phone number (E.164 format)
        shop_id: Shop ID

    Returns:
        CustomerContext if found, None otherwise
    """
    normalized = normalize_phone(phone_number)
    context = await CustomerContext.find_one({"phone_number": normalized, "shop_id": shop_id})
    return context


async def get_or_create_customer_context(phone_number: str, shop_id: str) -> CustomerContext:
    """Get or create customer context.

    Args:
        phone_number: Customer phone number (E.164 format)
        shop_id: Shop ID

    Returns:
        CustomerContext (existing or newly created)
    """
    normalized = normalize_phone(phone_number)
    context = await get_customer_context(normalized, shop_id)

    if not context:
        context = CustomerContext(
            phone_number=normalized,
            shop_id=shop_id,
            interactions=[],
            known_info={},
        )
        await context.insert()
        logger.debug("Created new customer context for %s", normalized)

    return context


async def update_context_from_call(call_log: CallLog) -> None:
    """Update customer context with call information.

    Args:
        call_log: The call log to extract information from
    """
    if not call_log.caller_number or not call_log.shop_id:
        return

    try:
        context = await get_or_create_customer_context(call_log.caller_number, call_log.shop_id)

        # Create interaction record
        interaction = InteractionRecord(
            channel="voice",
            timestamp=call_log.timestamp,
            intent=call_log.intent.value if call_log.intent else None,
            outcome=call_log.outcome.value if call_log.outcome else None,
            summary=_generate_call_summary(call_log),
        )

        # Add to interactions list
        context.interactions.append(interaction)

        # Update last interaction
        context.last_interaction = call_log.timestamp

        # Extract known info from call
        if call_log.tool_results:
            _update_known_info(context, call_log.tool_results)

        # Update work order ID if present
        if call_log.work_order_id:
            if "active_work_orders" not in context.known_info:
                context.known_info["active_work_orders"] = []
            work_orders = context.known_info["active_work_orders"]
            if isinstance(work_orders, list) and call_log.work_order_id not in work_orders:
                work_orders.append(call_log.work_order_id)

        await context.save()
        logger.debug("Updated customer context from call %s", call_log.call_sid)

    except Exception as e:
        logger.exception("Failed to update context from call: %s", e)


async def update_context_from_sms(phone_number: str, shop_id: str, summary: str) -> None:
    """Update customer context with SMS information.

    Args:
        phone_number: Customer phone number (E.164 format)
        shop_id: Shop ID
        summary: SMS message summary
    """
    try:
        context = await get_or_create_customer_context(phone_number, shop_id)

        # Create interaction record
        interaction = InteractionRecord(
            channel="sms",
            summary=summary,
        )

        # Add to interactions list
        context.interactions.append(interaction)

        # Update last interaction
        from app.common.utils import utc_now

        context.last_interaction = utc_now()

        await context.save()
        logger.debug("Updated customer context from SMS to %s", phone_number)

    except Exception as e:
        logger.exception("Failed to update context from SMS: %s", e)


def _generate_call_summary(call_log: CallLog) -> str:
    """Generate a brief summary of the call for context."""
    intent = call_log.intent.value if call_log.intent else "unknown"
    outcome = call_log.outcome.value if call_log.outcome else "unknown"

    # Generate summary based on intent and outcome
    if intent == "CHECK_STATUS":
        if outcome == "RESOLVED":
            tool_results = call_log.tool_results or {}
            status = tool_results.get("status", "")
            if status.upper() in ["READY", "COMPLETE"]:
                return "Vehicle ready for pickup"
            return "Checked vehicle status"
        return f"Call {outcome.lower()}"

    if intent == "GET_HOURS":
        return "Requested business hours"

    if intent == "GET_LOCATION":
        return "Requested location/address"

    if intent == "GET_SERVICES":
        return "Requested services information"

    return f"{intent.replace('_', ' ').lower()} - {outcome.lower()}"


def _update_known_info(context: CustomerContext, tool_results: dict[str, Any]) -> None:
    """Update known customer info from tool results."""
    # Extract customer name
    if "customer_name" in tool_results:
        context.known_info["name"] = tool_results["customer_name"]
    elif "work_orders" in tool_results:
        work_orders = tool_results.get("work_orders", [])
        if isinstance(work_orders, list) and work_orders:
            first_order = work_orders[0]
            if isinstance(first_order, dict) and "customer_name" in first_order:
                context.known_info["name"] = first_order["customer_name"]

    # Extract vehicle info
    if "vehicle" in tool_results:
        vehicle = tool_results["vehicle"]
        if isinstance(vehicle, dict):
            if "vehicles" not in context.known_info:
                context.known_info["vehicles"] = []
            vehicles = context.known_info["vehicles"]
            if isinstance(vehicles, list):
                # Check if vehicle already exists
                vehicle_exists = any(
                    v.get("make") == vehicle.get("make")
                    and v.get("model") == vehicle.get("model")
                    and v.get("year") == vehicle.get("year")
                    for v in vehicles
                    if isinstance(v, dict)
                )
                if not vehicle_exists:
                    vehicles.append(vehicle)
    elif "work_orders" in tool_results:
        work_orders = tool_results.get("work_orders", [])
        if isinstance(work_orders, list):
            for order in work_orders:
                if isinstance(order, dict) and "vehicle" in order:
                    vehicle = order["vehicle"]
                    if isinstance(vehicle, dict):
                        if "vehicles" not in context.known_info:
                            context.known_info["vehicles"] = []
                        vehicles = context.known_info["vehicles"]
                        if isinstance(vehicles, list):
                            vehicle_exists = any(
                                v.get("make") == vehicle.get("make")
                                and v.get("model") == vehicle.get("model")
                                and v.get("year") == vehicle.get("year")
                                for v in vehicles
                                if isinstance(v, dict)
                            )
                            if not vehicle_exists:
                                vehicles.append(vehicle)
