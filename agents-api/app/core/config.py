from typing import List, Optional

from pydantic import PostgresDsn, field_validator
from pydantic_settings import BaseSettings


class Settings(BaseSettings):
    """
    Application settings loaded from environment variables.
    """

    # API Settings
    API_KEY_SECRET: str = ""
    PORT: int = 8000
    HOST: str = "0.0.0.0"
    LOG_LEVEL: str = "info"
    ENVIRONMENT: str = "development"
    CORS_ORIGINS: List[str] = ["http://localhost:3010", "http://localhost:8080"]

    @field_validator("CORS_ORIGINS", mode="before")
    def parse_cors_origins(cls, v):
        """Parse the CORS origins from a comma-separated string."""
        if isinstance(v, str):
            return v.split(",")
        return v

    # Database Settings
    DATABASE_URL: PostgresDsn

    # OpenAI Settings
    OPENAI_DEFAULT_MODEL: str = "gpt-4o-mini"
    OPENAI_API_KEY: str = ""
    
    # Agent Tracing Settings (disabled, as I've used all the free runs :/ )
    """
    LANGSMITH_TRACING: bool = False
    LANGSMITH_ENDPOINT: str = ""
    LANGSMITH_API_KEY: str = ""
    LANGSMITH_PROJECT: str = ""
    """

    # Alumini Extract Service API Settings
    ALUMNI_EXTRACT_API_KEY: str = ""
    ALUMNI_EXTRACT_BASE_URL: str = "https://enrichlayer.com/api/v2"

    # Bright Data Settings
    BRIGHTDATA_API_KEY: str = ""
    BRIGHTDATA_BASE_URL: str = "https://api.brightdata.com/datasets/v3"
    BRIGHTDATA_COMPANY_DATASET_ID: str = ""

    # Cloudinary Settings
    CLOUDINARY_CLOUD_NAME: str = ""
    CLOUDINARY_API_KEY: str = ""
    CLOUDINARY_API_SECRET: str = ""

    # Geolocation API Settings
    GEOLOCATION_API_KEY: str = ""
    GEOLOCATION_BASE_URL: str = "https://api.openweathermap.org/geo/1.0/direct?q="

    # Levels.fyi Settings
    LEVELS_FYI_BASE_URL: str = "https://www.levels.fyi/api/salaries"

    class Config:
        env_file = ".env"
        case_sensitive = True
        extra = "ignore"


# Create settings instance
settings = Settings()
