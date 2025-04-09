import logging
import time
from fastapi import Request, HTTPException, status
from starlette.middleware.base import BaseHTTPMiddleware, RequestResponseEndpoint
from starlette.responses import Response

from app.core.config import settings

logger = logging.getLogger(__name__)


class LoggingMiddleware(BaseHTTPMiddleware):
    """
    Middleware to log request/response details for monitoring and debugging.
    """

    async def dispatch(self, request: Request, call_next: RequestResponseEndpoint) -> Response:
        start_time = time.time()

        # Log request details
        logger.info(f"Request: {request.method} {request.url.path}")

        # Process the request through the endpoint
        try:
            response = await call_next(request)
            process_time = time.time() - start_time

            # Log response details
            logger.info(
                f"Response: {request.method} {request.url.path} - "
                f"Status: {response.status_code} - "
                f"Duration: {process_time:.3f}s"
            )

            # Add processing time header
            response.headers["X-Process-Time"] = str(process_time)
            return response

        except Exception as e:
            process_time = time.time() - start_time
            logger.error(
                f"Error: {request.method} {request.url.path} - "
                f"Error: {str(e)} - "
                f"Duration: {process_time:.3f}s"
            )
            raise


class APIKeyMiddleware(BaseHTTPMiddleware):
    """
    Middleware to authenticate requests using an API key.
    """

    async def dispatch(self, request: Request, call_next: RequestResponseEndpoint) -> Response:
        # Skip API key check for specific paths
        if request.url.path in ["/", "/health", "/docs", "/redoc", "/openapi.json"]:
            return await call_next(request)

        # Get API key from header
        api_key = request.headers.get("X-API-Key")

        # Check if API key is required and valid
        if settings.API_KEY_SECRET and settings.API_KEY_SECRET != "":
            if not api_key:
                logger.warning(
                    f"Unauthorized access attempt: Missing API key - {request.method} {request.url.path}"
                )
                raise HTTPException(
                    status_code=status.HTTP_401_UNAUTHORIZED,
                    detail="API key missing",
                )

            if api_key != settings.API_KEY_SECRET:
                logger.warning(
                    f"Unauthorized access attempt: Invalid API key - {request.method} {request.url.path}"
                )
                raise HTTPException(
                    status_code=status.HTTP_401_UNAUTHORIZED,
                    detail="Invalid API key",
                )

        return await call_next(request)
