"""Service manager for handling service lifecycles."""

import logging
from contextlib import AsyncExitStack

from app.agents.location import location_agent
from app.services.company import company_service
from app.services.coordinates import coordinates_service
from app.services.linkedin import linkedin_service

logger = logging.getLogger(__name__)


class ServiceManager:
    def __init__(self):
        self.exit_stack = AsyncExitStack()
        self._initialized = False

    async def initialize(self):
        """Initialize all services."""
        if self._initialized:
            return

        logger.info("Initializing services...")

        # Enter all service context managers
        await self.exit_stack.enter_async_context(company_service)
        await self.exit_stack.enter_async_context(coordinates_service)
        await self.exit_stack.enter_async_context(linkedin_service)
        await self.exit_stack.enter_async_context(location_agent)

        self._initialized = True
        logger.info("Services initialized successfully")

    async def cleanup(self):
        """Cleanup all services."""
        if not self._initialized:
            return

        logger.info("Cleaning up services...")
        await self.exit_stack.aclose()
        self._initialized = False
        logger.info("Services cleaned up successfully")


# Global service manager instance
service_manager = ServiceManager()
