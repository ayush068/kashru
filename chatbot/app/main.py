"""FastAPI application factory for the Kashru chatbot API.

Run locally with: ``uvicorn app.main:app --reload``
"""

from contextlib import asynccontextmanager
import logging
import time

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from app.api.v1.chat import router as chat_router
from app.core.config import get_settings
from app.core.logging import setup_logging
from app.services.llm_service import get_chat_service

logger = logging.getLogger(__name__)


@asynccontextmanager
async def lifespan(_: FastAPI):
    """Warm up heavy singletons (embeddings + FAISS) before serving traffic.

    Moving model and index loading into startup keeps the first user
    request from paying the cold-start cost.
    """
    started = time.perf_counter()
    service = get_chat_service()
    service.retrieval.embed_query("startup warm-up")
    logger.info(
        "Chatbot warmed up (embeddings + FAISS index loaded) in %.0fms",
        (time.perf_counter() - started) * 1000,
    )
    yield


def create_app() -> FastAPI:
    """Build the configured FastAPI app: CORS, routes, startup warm-up."""
    setup_logging()
    settings = get_settings()

    app = FastAPI(title="Kashru Chatbot API", version="1.0.0", lifespan=lifespan)

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
        """Liveness probe used by uptime checks."""
        return {"ok": True}

    return app


app = create_app()
