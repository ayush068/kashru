"""API v1 chat routes: thin handlers over the ChatService pipeline."""

from fastapi import APIRouter, HTTPException

from app.models.schemas import ChatRequest, ChatResponse
from app.services.llm_service import ChatService
from app.core.config import get_settings

router = APIRouter(prefix="/api/v1", tags=["chat"])


@router.post(
    "/chat",
    response_model=ChatResponse,
    responses={
        502: {"description": "AI provider unavailable"},
        503: {"description": "Chatbot initialization unavailable"},
    },
)
def chat(payload: ChatRequest) -> ChatResponse:
    """Answer a visitor message through the RAG + LLM pipeline."""

    try:
        # Create the service inside the protected block so that
        # FAISS / embeddings initialization errors are caught.
        service = ChatService(get_settings())

        result = service.answer(payload.message)

    except FileNotFoundError as exc:
        raise HTTPException(
            status_code=503,
            detail=str(exc),
        ) from exc

    except Exception as exc:
        raise HTTPException(
            status_code=502,
            detail=(
                "The assistant is temporarily unavailable. "
                "Please try again shortly."
            ),
        ) from exc

    return ChatResponse(
        answer=result.answer,
        handoff=result.handoff,
        whatsapp_url=(
            service.settings.whatsapp_url
            if result.handoff
            else None
        ),
        sources=result.sources,
    )