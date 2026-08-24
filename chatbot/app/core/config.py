"""Centralized application settings loaded from environment / .env file."""

from functools import lru_cache
from pathlib import Path

from pydantic_settings import BaseSettings, SettingsConfigDict


class Settings(BaseSettings):
    """Environment-driven configuration for the chatbot API.

    Every field maps to an upper-case environment variable of the same
    name and falls back to the default shown here when the variable is absent.
    """

    model_config = SettingsConfigDict(
        env_file=".env",
        env_file_encoding="utf-8",
        extra="ignore",
    )

    groq_api_key: str | None = None
    gemini_api_key: str | None = None

    groq_model: str = "openai/gpt-oss-20b"
    gemini_model: str = "gemini-3.7-flash"

    # Gemini API embeddings.
    # This avoids loading sentence-transformers / torch locally.
    embedding_model_name: str = "gemini-embedding-001"              

    knowledge_dir: Path = Path("chatbot/knowledge")
    faiss_index_dir: Path = Path("chatbot/storage/faiss_index") 

    # Comma-separated list; browsers send Origin "null" for pages opened
    # directly via file://, 5500 is the common Live Server dev port.
    allowed_origins: str = (
        "https://kashru.san-vad.com,"
        "null,"
        "http://localhost:8000,"
        "http://127.0.0.1:8000,"
        "http://localhost:5500,"
        "http://127.0.0.1:5500"
    )

    whatsapp_url: str = (
        "https://wa.me/919806604871?text=Hi%20Kashru%20Technologies%2C%20"
        "I%20want%20to%20discuss%20a%20project"
    )

    @property
    def cors_origins(self) -> list[str]:
        """Parse the comma-separated ALLOWED_ORIGINS value into a list."""
        return [
            origin.strip()
            for origin in self.allowed_origins.split(",")
            if origin.strip()
        ]


@lru_cache
def get_settings() -> Settings:
    """Return a cached Settings instance built from env vars and .env."""
    return Settings()