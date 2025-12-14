"""Clerk JWT authentication middleware for FastAPI."""

import logging
from dataclasses import dataclass
from typing import Annotated

import httpx
import jwt
from cryptography.hazmat.primitives.asymmetric.rsa import RSAPublicKey
from fastapi import Depends, HTTPException, status
from fastapi.security import HTTPAuthorizationCredentials, HTTPBearer

from app.config import get_settings

logger = logging.getLogger(__name__)

# HTTP Bearer token security scheme
security = HTTPBearer(auto_error=False)


@dataclass
class AuthenticatedUser:
    """Represents an authenticated user from Clerk."""

    user_id: str
    email: str | None = None
    first_name: str | None = None
    last_name: str | None = None


# Cache for Clerk JWKS (JSON Web Key Set)
_jwks_cache: dict | None = None


async def _get_clerk_jwks() -> dict:
    """Fetch Clerk's JWKS for JWT verification.

    Returns cached version if available.
    """
    global _jwks_cache

    if _jwks_cache is not None:
        return _jwks_cache

    settings = get_settings()
    if not settings.clerk_secret_key:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Clerk secret key not configured",
        )

    # Extract Clerk frontend API from the secret key
    # Format: sk_test_xxxx or sk_live_xxxx
    # We need to get the JWKS from Clerk's API
    try:
        async with httpx.AsyncClient() as client:
            # Clerk JWKS endpoint - uses the publishable key domain
            # The publishable key is like pk_test_xxxx or pk_live_xxxx
            # We'll construct the JWKS URL from the Clerk instance
            pk = settings.clerk_publishable_key
            if not pk:
                raise HTTPException(
                    status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
                    detail="Clerk publishable key not configured",
                )

            # Extract the Clerk frontend API URL from publishable key
            # For development, we'll use a simpler approach
            # Clerk's JWKS is at: https://<clerk-frontend-api>/.well-known/jwks.json
            # The frontend API can be derived from the dashboard or we use env var

            # Alternative: Use Clerk's Backend API to verify
            # For now, we'll verify using the secret key directly
            response = await client.get(
                "https://api.clerk.com/v1/jwks",
                headers={"Authorization": f"Bearer {settings.clerk_secret_key}"},
            )
            response.raise_for_status()
            _jwks_cache = response.json()
            return _jwks_cache
    except httpx.HTTPError as e:
        logger.error("Failed to fetch Clerk JWKS: %s", e)
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to verify authentication",
        ) from e


def _get_signing_key(jwks: dict, token: str) -> RSAPublicKey:
    """Get the signing key from JWKS that matches the token's kid."""
    from jwt.algorithms import RSAAlgorithm

    try:
        unverified_header = jwt.get_unverified_header(token)
        kid = unverified_header.get("kid")

        for key in jwks.get("keys", []):
            if key.get("kid") == kid:
                # Convert JWK to RSA public key
                rsa_key = RSAAlgorithm.from_jwk(key)
                if not isinstance(rsa_key, RSAPublicKey):
                    raise HTTPException(
                        status_code=status.HTTP_401_UNAUTHORIZED,
                        detail="Invalid key type",
                    )
                return rsa_key

        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Unable to find signing key",
        )
    except jwt.exceptions.DecodeError as e:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid token format",
        ) from e


async def get_current_user(
    credentials: Annotated[HTTPAuthorizationCredentials | None, Depends(security)],
) -> AuthenticatedUser:
    """Dependency to get the current authenticated user from Clerk JWT.

    Args:
        credentials: The HTTP Bearer credentials from the request.

    Returns:
        AuthenticatedUser with user details from the JWT.

    Raises:
        HTTPException: If authentication fails.
    """
    if credentials is None:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Authentication required",
            headers={"WWW-Authenticate": "Bearer"},
        )

    token = credentials.credentials

    try:
        # Fetch JWKS for verification
        jwks = await _get_clerk_jwks()
        signing_key = _get_signing_key(jwks, token)

        # Verify and decode the JWT
        payload = jwt.decode(
            token,
            signing_key,
            algorithms=["RS256"],
            options={"verify_aud": False},  # Clerk tokens may not have aud
        )

        # Extract user info from Clerk JWT claims
        user_id = payload.get("sub")
        if not user_id:
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail="Invalid token: missing user ID",
            )

        return AuthenticatedUser(
            user_id=user_id,
            email=payload.get("email"),
            first_name=payload.get("first_name"),
            last_name=payload.get("last_name"),
        )

    except jwt.ExpiredSignatureError as e:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Token has expired",
        ) from e
    except jwt.InvalidTokenError as e:
        logger.warning("Invalid JWT token: %s", e)
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid authentication token",
        ) from e


async def get_optional_user(
    credentials: Annotated[HTTPAuthorizationCredentials | None, Depends(security)],
) -> AuthenticatedUser | None:
    """Dependency to optionally get the current user.

    Returns None if no valid authentication is provided instead of raising.
    """
    if credentials is None:
        return None

    try:
        return await get_current_user(credentials)
    except HTTPException:
        return None
