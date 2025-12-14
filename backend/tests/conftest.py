"""Shared test fixtures and configuration."""

import pytest

# Configure pytest-asyncio to use asyncio mode
pytest_plugins = ["pytest_asyncio"]


@pytest.fixture
def anyio_backend() -> str:
    """Use asyncio as the async backend."""
    return "asyncio"
