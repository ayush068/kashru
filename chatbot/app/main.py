"""FastAPI application factory for the Kashru chatbot API."""

from contextlib import asynccontextmanager
import logging

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from app.api.v1.chat import router as chat_router
from app.core.config import get_settings
from app.core.logging import setup_logging

logger = logging.getLogger(__name__)


@asynccontextmanager
async def lifespan(_: FastAPI):
    """Keep startup lightweight so Render can detect the HTTP port quickly."""
    logger.info("Kashru Chatbot API starting...")
    yield
    logger.info("Kashru Chatbot API shutting down...")


def create_app() -> FastAPI:
    """Build the configured FastAPI app."""
    setup_logging()
    settings = get_settings()

    app = FastAPI(
        title="Kashru Chatbot API",
        version="1.0.0",
        lifespan=lifespan,
    )

    app.add_middleware(
        CORSMiddleware,
        allow_origins=settings.cors_origins,
        allow_credentials=False,
        allow_methods=["GET", "POST", "OPTIONS"],
        allow_headers=["Content-Type", "Authorization"],
        max_age=600,
    )

    app.include_router(chat_router)

    @app.get("/health", tags=["health"])
    def health():
        """Liveness probe used by Render."""
        return {"ok": True}

    return app


app = create_app()