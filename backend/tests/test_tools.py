"""Tests for the ToolRegistry."""

import pytest

from app.adapters.mock.adapter import MockAdapter
from app.modules.voice.tools import TOOL_SCHEMAS, ToolRegistry


@pytest.fixture
def tool_registry():
    """Create a ToolRegistry with MockAdapter."""
    adapter = MockAdapter()
    return ToolRegistry(adapter)


def test_tool_schemas_defined():
    """Verify tool schemas are properly defined."""
    assert len(TOOL_SCHEMAS) >= 6

    tool_names = [t["function"]["name"] for t in TOOL_SCHEMAS]
    assert "lookup_work_order" in tool_names
    assert "get_business_hours" in tool_names
    assert "get_location" in tool_names
    assert "list_services" in tool_names
    assert "transfer_to_human" in tool_names


def test_get_tools_schema(tool_registry):
    """Test getting the tools schema."""
    schema = tool_registry.get_tools_schema()

    assert len(schema) >= 6
    assert all("function" in tool for tool in schema)


@pytest.mark.asyncio
async def test_execute_lookup_work_order(tool_registry):
    """Test executing lookup_work_order tool."""
    result = await tool_registry.execute("lookup_work_order", {"customer_name": "John Smith"})

    assert result["success"] is True
    assert "work_orders" in result
    assert len(result["work_orders"]) >= 1


@pytest.mark.asyncio
async def test_execute_get_business_hours(tool_registry):
    """Test executing get_business_hours tool."""
    result = await tool_registry.execute("get_business_hours", {})

    assert result["success"] is True
    assert "hours" in result


@pytest.mark.asyncio
async def test_execute_get_location(tool_registry):
    """Test executing get_location tool."""
    result = await tool_registry.execute("get_location", {})

    assert result["success"] is True
    assert "location" in result


@pytest.mark.asyncio
async def test_execute_list_services(tool_registry):
    """Test executing list_services tool."""
    result = await tool_registry.execute("list_services", {})

    assert result["success"] is True
    assert "services" in result


@pytest.mark.asyncio
async def test_execute_transfer_to_human(tool_registry):
    """Test executing transfer_to_human tool."""
    result = await tool_registry.execute("transfer_to_human", {"reason": "Customer requested"})

    assert result["success"] is True
    assert result["action"] == "transfer"


@pytest.mark.asyncio
async def test_execute_unknown_tool(tool_registry):
    """Test executing an unknown tool."""
    result = await tool_registry.execute("unknown_tool", {})

    assert result["success"] is False
    assert "error" in result
