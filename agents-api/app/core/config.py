import os
from typing import List, Optional
from pydantic import PostgresDsn, field_validator
from pydantic_settings import BaseSettings


class Settings(BaseSettings):
    """
    Application settings loaded from environment variables.
    """

    # API Settings
    API_KEY_SECRET: str = ""  # Secure API key for authentication
    PORT: int = 8000
    HOST: str = "0.0.0.0"
    LOG_LEVEL: str = "info"
    ENVIRONMENT: str = "development"
    CORS_ORIGINS: List[str] = ["http://localhost:3000", "http://localhost:8080"]

    @field_validator("CORS_ORIGINS", mode='before')
    def parse_cors_origins(cls, v):
        """Parse the CORS origins from a comma-separated string."""
        if isinstance(v, str):
            return v.split(",")
        return v

    # Database Settings
    DATABASE_URL: PostgresDsn

    # LLM Settings
    OLLAMA_BASE_URL: str = "http://localhost:11434"
    DEFAULT_MODEL: str = "llama3"

    # Proxycurl API Settings
    PROXYCURL_API_KEY: Optional[str] = None

    class Config:
        env_file = ".env"
        case_sensitive = True


# Create settings instance
settings = Settings()
