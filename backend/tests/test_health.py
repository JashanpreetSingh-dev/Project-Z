"""Tests for health check endpoints."""

import pytest
from httpx import AsyncClient


@pytest.mark.asyncio
async def test_health_check(client: AsyncClient):
    """Test health check endpoint returns healthy status."""
    response = await client.get("/health")
    assert response.status_code == 200
    assert response.json() == {"status": "healthy"}


@pytest.mark.asyncio
async def test_root_endpoint(client: AsyncClient):
    """Test root endpoint returns service info."""
    response = await client.get("/")
    assert response.status_code == 200

    data = response.json()
    assert data["service"] == "Voice Receptionist API"
    assert data["status"] == "running"
    assert "version" in data
