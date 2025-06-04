"""HTTP client utility with retries, backoff, and logging."""

import asyncio
import logging
import time
from typing import Any, Dict, Optional

import httpx
from httpx import Response
from tenacity import (
    before_sleep_log,
    retry,
    retry_if_exception_type,
    stop_after_attempt,
    wait_exponential,
)

from app.core.config import settings

logger = logging.getLogger(__name__)


class HTTPClient:
    """
    HTTP client with retry capabilities, timeouts, and logging.
    """

    def __init__(
        self,
        base_url: Optional[str] = None,
        timeout: int = 30,
        max_retries: int = 3,
        headers: Optional[Dict[str, str]] = None,
    ):
        """
        Initialize the HTTP client.
        
        Args:
            base_url: Base URL for all requests
            timeout: Request timeout in seconds
            max_retries: Maximum number of retry attempts
            headers: Default headers for all requests
        """
        self.base_url = base_url
        self.timeout = timeout
        self.max_retries = max_retries
        self.default_headers = headers or {}
        
        # Add common headers
        if "User-Agent" not in self.default_headers:
            self.default_headers["User-Agent"] = f"AgentsAPI/{settings.ENVIRONMENT}"

        # Initialize the client
        self._init_clients()
        
    def _init_clients(self):
        """Initialize the HTTP clients with current configuration."""
        # Create kwargs dict for client initialization
        client_kwargs = {
            "timeout": self.timeout,
            "headers": self.default_headers
        }
        
        # Only add base_url if it's not None
        if self.base_url:
            client_kwargs["base_url"] = self.base_url
            
        # Initialize the clients
        self.client = httpx.Client(**client_kwargs)
        self.async_client = httpx.AsyncClient(**client_kwargs)

    def __del__(self):
        """Ensure client is closed when object is destroyed."""
        self.close()

    def close(self):
        """Close the HTTP clients."""
        if hasattr(self, 'client') and self.client:
            self.client.close()
        
        if hasattr(self, 'async_client') and self.async_client:
            # Use the synchronous close if available to avoid dangling coroutine warnings
            try:
                self.async_client.close()
            except AttributeError:
                # Fallback for older versions of httpx
                asyncio.run(self.async_client.aclose())
    
    @retry(
        retry=retry_if_exception_type((httpx.ConnectTimeout, httpx.ReadTimeout, httpx.ConnectError)),
        stop=stop_after_attempt(3),
        wait=wait_exponential(multiplier=1, min=1, max=10),
        before_sleep=before_sleep_log(logger, logging.WARNING),
    )
    def _request(
        self,
        method: str,
        url: str,
        **kwargs
    ) -> Response:
        """
        Make an HTTP request with retries.
        """
        start_time = time.time()
        merged_headers = {**self.default_headers, **kwargs.get("headers", {})}
        kwargs["headers"] = merged_headers
                
        try:
            response = self.client.request(method, url, **kwargs)
            elapsed = time.time() - start_time
            
            # Log based on response status
            if response.status_code >= 400:
                logger.warning(
                    f"{method} {url} failed with status {response.status_code} in {elapsed:.2f}s"
                )
                # Log response content for debug purposes
                try:
                    logger.warning(f"Response content: {response.text[:500]}")
                except Exception:
                    pass
            else:
                logger.debug(
                    f"{method} {url} completed with status {response.status_code} in {elapsed:.2f}s"
                )
                
            return response
            
        except httpx.HTTPError as e:
            elapsed = time.time() - start_time
            logger.error(f"{method} {url} error: {str(e)} after {elapsed:.2f}s")
            raise

    @retry(
        retry=retry_if_exception_type((httpx.ConnectTimeout, httpx.ReadTimeout, httpx.ConnectError)),
        stop=stop_after_attempt(3),
        wait=wait_exponential(multiplier=1, min=1, max=10),
        before_sleep=before_sleep_log(logger, logging.WARNING),
    )
    async def _async_request(
        self,
        method: str,
        url: str,
        **kwargs
    ) -> Response:
        """
        Make an asynchronous HTTP request with retries.
        
        Args:
            method: HTTP method (GET, POST, etc.)
            url: URL to send the request to
            **kwargs: Additional arguments to pass to the httpx request
            
        Returns:
            Response object
        """
        start_time = time.time()
        merged_headers = {**self.default_headers, **kwargs.get("headers", {})}
        kwargs["headers"] = merged_headers

        try:
            response = await self.async_client.request(method, url, **kwargs)
            elapsed = time.time() - start_time
            
            # Log based on response status
            if response.status_code >= 400:
                logger.warning(
                    f"{method} {url} failed with status {response.status_code} in {elapsed:.2f}s"
                )
            else:
                logger.debug(
                    f"{method} {url} completed with status {response.status_code} in {elapsed:.2f}s"
                )
                
            return response
            
        except httpx.HTTPError as e:
            elapsed = time.time() - start_time
            logger.error(f"{method} {url} error: {str(e)} after {elapsed:.2f}s")
            raise
    
    def set_base_url(self, base_url: str) -> None:
        """
        Update the base URL and reinitialize the clients.
        """
        self.base_url = base_url
        self.close()
        self._init_clients()
        logger.debug(f"Updated base URL to: {base_url}")
    
    def set_headers(self, headers: Dict[str, str]) -> None:
        """
        Update the default headers and reinitialize the clients.
        """
        self.default_headers.update(headers)
        self.close()
        self._init_clients()
        logger.debug("Updated default headers")

    # Synchronous methods
    def get(self, url: str, **kwargs) -> Response:
        """Make a GET request."""
        return self._request("GET", url, **kwargs)
    
    def post(self, url: str, **kwargs) -> Response:
        """Make a POST request."""
        return self._request("POST", url, **kwargs)
    
    def put(self, url: str, **kwargs) -> Response:
        """Make a PUT request."""
        return self._request("PUT", url, **kwargs)
    
    def delete(self, url: str, **kwargs) -> Response:
        """Make a DELETE request."""
        return self._request("DELETE", url, **kwargs)
    
    def patch(self, url: str, **kwargs) -> Response:
        """Make a PATCH request."""
        return self._request("PATCH", url, **kwargs)
    
    # Async methods
    async def aget(self, url: str, **kwargs) -> Response:
        """Make an async GET request."""
        return await self._async_request("GET", url, **kwargs)
    
    async def apost(self, url: str, **kwargs) -> Response:
        """Make an async POST request."""
        return await self._async_request("POST", url, **kwargs)
    
    async def aput(self, url: str, **kwargs) -> Response:
        """Make an async PUT request."""
        return await self._async_request("PUT", url, **kwargs)
    
    async def adelete(self, url: str, **kwargs) -> Response:
        """Make an async DELETE request."""
        return await self._async_request("DELETE", url, **kwargs)
    
    async def apatch(self, url: str, **kwargs) -> Response:
        """Make an async PATCH request."""
        return await self._async_request("PATCH", url, **kwargs)
    
    # Convenience methods
    def get_json(self, url: str, **kwargs) -> Any:
        """Make a GET request and return the JSON response."""
        response = self.get(url, **kwargs)
        response.raise_for_status()
        return response.json()
    
    def post_json(self, url: str, **kwargs) -> Any:
        """Make a POST request and return the JSON response."""
        response = self.post(url, **kwargs)
        response.raise_for_status()
        return response.json()
    
    async def aget_json(self, url: str, **kwargs) -> Any:
        """Make an async GET request and return the JSON response."""
        response = await self.aget(url, **kwargs)
        response.raise_for_status()
        return response.json()
    
    async def apost_json(self, url: str, **kwargs) -> Any:
        """Make an async POST request and return the JSON response."""
        response = await self.apost(url, **kwargs)
        response.raise_for_status()
        return response.json()


default_client = HTTPClient(headers={"Content-Type": "application/json"}) 