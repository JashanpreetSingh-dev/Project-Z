"""Business logic for call logging."""

from datetime import UTC, datetime, timedelta

from beanie import PydanticObjectId

from app.common.exceptions import NotFoundError
from app.modules.calls.models import CallLog, CallOutcome
from app.modules.calls.schemas import CallAnalytics, CallLogCreate, DailyCallCount


async def get_call_logs(shop_id: str | None = None, limit: int = 100) -> list[CallLog]:
    """Get call logs with optional filters."""
    if shop_id:
        return await CallLog.find(CallLog.shop_id == shop_id).limit(limit).to_list()
    return await CallLog.find_all().limit(limit).to_list()


async def get_call_log_by_id(call_id: str) -> CallLog:
    """Get a call log by ID."""
    call_log = await CallLog.get(PydanticObjectId(call_id))
    if not call_log:
        raise NotFoundError("Call log", call_id)
    return call_log


async def create_call_log(call_data: CallLogCreate) -> CallLog:
    """Create a new call log."""
    call_log = CallLog(**call_data.model_dump())
    await call_log.insert()
    return call_log


async def get_call_analytics(shop_id: str, days: int = 30) -> CallAnalytics:
    """Get aggregated call analytics for a shop.

    Args:
        shop_id: The shop ID to get analytics for.
        days: Number of days to include in the analysis (default 30).

    Returns:
        CallAnalytics with aggregated metrics.
    """
    now = datetime.now(UTC)
    period_start = now - timedelta(days=days)

    # Get all calls in the period
    calls = await CallLog.find(
        CallLog.shop_id == shop_id,
        CallLog.timestamp >= period_start,
    ).to_list()

    total_calls = len(calls)

    # Calculate average duration (only for calls with duration)
    durations = [c.duration_seconds for c in calls if c.duration_seconds is not None]
    avg_duration = sum(durations) / len(durations) if durations else None

    # Group calls by day
    calls_by_day_dict: dict[str, int] = {}
    for call in calls:
        date_str = call.timestamp.strftime("%Y-%m-%d")
        calls_by_day_dict[date_str] = calls_by_day_dict.get(date_str, 0) + 1

    # Fill in missing days with zero counts
    calls_by_day: list[DailyCallCount] = []
    current_date = period_start.date()
    end_date = now.date()
    while current_date <= end_date:
        date_str = current_date.strftime("%Y-%m-%d")
        calls_by_day.append(DailyCallCount(date=date_str, count=calls_by_day_dict.get(date_str, 0)))
        current_date += timedelta(days=1)

    # Count outcomes
    outcomes: dict[str, int] = {}
    for call in calls:
        outcome = call.outcome.value
        outcomes[outcome] = outcomes.get(outcome, 0) + 1

    # Calculate resolution rate (RESOLVED / total * 100)
    resolved_count = outcomes.get(CallOutcome.RESOLVED.value, 0)
    resolution_rate = (resolved_count / total_calls * 100) if total_calls > 0 else 0.0

    # Count intents
    intents: dict[str, int] = {}
    for call in calls:
        intent = call.intent.value
        intents[intent] = intents.get(intent, 0) + 1

    # Count calls by hour
    calls_by_hour: dict[str, int] = {}
    for call in calls:
        hour = str(call.timestamp.hour)
        calls_by_hour[hour] = calls_by_hour.get(hour, 0) + 1

    return CallAnalytics(
        period_start=period_start,
        period_end=now,
        total_calls=total_calls,
        avg_duration_seconds=avg_duration,
        calls_by_day=calls_by_day,
        outcomes=outcomes,
        resolution_rate=round(resolution_rate, 1),
        intents=intents,
        calls_by_hour=calls_by_hour,
    )
