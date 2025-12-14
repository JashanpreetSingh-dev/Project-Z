"""Business logic for call logging."""

from beanie import PydanticObjectId

from app.common.exceptions import NotFoundError
from app.modules.calls.models import CallLog
from app.modules.calls.schemas import CallLogCreate


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
