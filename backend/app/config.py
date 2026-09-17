import os
from pydantic_settings import BaseSettings
from dotenv import load_dotenv

# Load .env from the backend directory
load_dotenv(os.path.join(os.path.dirname(os.path.dirname(__file__)), ".env"))


class Settings(BaseSettings):
    """Application settings loaded from environment variables."""

    GROQ_API_KEY: str = ""
    GROQ_MODEL: str = "qwen/qwen3.8-27b"

    class Config:
        env_file = ".env"
        extra = "ignore"


settings = Settings()


def validate_settings() -> None:
    """Validate that all required settings are present."""
    if not settings.GROQ_API_KEY:
        raise ValueError(
            "GROQ_API_KEY is not set. Please create a backend/.env file with your Groq API key. "
            "See .env.example for reference."
        )
