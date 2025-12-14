"""Custom exceptions for the application."""

from fastapi import HTTPException, status


class NotFoundError(HTTPException):
    """Resource not found exception."""

    def __init__(self, resource: str, resource_id: str) -> None:
        super().__init__(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"{resource} with id {resource_id} not found",
        )


class ConflictError(HTTPException):
    """Resource conflict exception."""

    def __init__(self, detail: str) -> None:
        super().__init__(
            status_code=status.HTTP_409_CONFLICT,
            detail=detail,
        )


class BadRequestError(HTTPException):
    """Bad request exception."""

    def __init__(self, detail: str) -> None:
        super().__init__(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=detail,
        )
