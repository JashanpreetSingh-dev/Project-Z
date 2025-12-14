"""Shared test fixtures and configuration."""

import pytest


@pytest.fixture
def anyio_backend() -> str:
    """Use asyncio as the async backend."""
    return "asyncio"


# TODO: Add database fixtures for integration tests
# TODO: Add mock fixtures for external services
