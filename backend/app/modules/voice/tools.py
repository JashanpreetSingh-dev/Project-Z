"""Tool registry for MCP-style LLM function calling.

This module provides the interface between the LLM and the shop system adapters.
Each tool maps to an adapter method that fetches data from the shop's system.
"""

from typing import Any

from app.adapters.base import ShopSystemAdapter

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
]


class ToolRegistry:
    """MCP-style tool registry for LLM function calling.

    This class bridges the LLM's function calls to the shop system adapter.
    It provides the OpenAI function schema and dispatches tool calls to
    the appropriate adapter methods.
    """

    def __init__(self, adapter: ShopSystemAdapter):
        """Initialize tool registry with a shop system adapter.

        Args:
            adapter: The adapter to use for fetching shop data.
        """
        self.adapter = adapter

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

            else:
                return {"success": False, "error": f"Unknown tool: {tool_name}"}

        except Exception as e:
            return {"success": False, "error": str(e)}
