import logging
from fastapi import FastAPI, Depends
from fastapi.middleware.cors import CORSMiddleware
from starlette.middleware.base import BaseHTTPMiddleware
import os
from dotenv import load_dotenv

from app.core.config import settings
from app.api.routes import api_router
from app.core.middlewares import LoggingMiddleware, APIKeyMiddleware

# Load environment variables from .env file
load_dotenv()

app = FastAPI(
    title="Agents API",
    description="API for job title classification and LinkedIn data extraction",
    version="0.1.0",
)

# Configure logging
logging.basicConfig(
    level=logging.getLevelName(settings.LOG_LEVEL.upper()),
    format="%(asctime)s - %(name)s - %(levelname)s - %(message)s",
)

# Set up CORS middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.CORS_ORIGINS,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Add custom middlewares
app.add_middleware(LoggingMiddleware)
app.add_middleware(APIKeyMiddleware)

# Include all routers
app.include_router(api_router, prefix="/api")


@app.get("/")
async def root():
    """Root endpoint that returns basic API information."""
    return {
        "name": "Agents API",
        "version": "0.1.0",
        "status": "running",
    }


@app.get("/health")
async def health_check():
    """Health check endpoint for monitoring."""
    return {"status": "ok"}


if __name__ == "__main__":
    import uvicorn

    uvicorn.run(
        "app.main:app",
        host=settings.HOST,
        port=settings.PORT,
        reload=settings.ENVIRONMENT == "development",
    )
