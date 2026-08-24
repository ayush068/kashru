"""API v1 chat routes: thin handlers over the ChatService pipeline."""

from fastapi import APIRouter, Depends, HTTPException

from app.models.schemas import ChatRequest, ChatResponse
from app.services.llm_service import ChatService, get_chat_service

router = APIRouter(prefix="/api/v1", tags=["chat"])


@router.post(
    "/chat",
    response_model=ChatResponse,
    responses={502: {"description": "AI provider unavailable"}},
)
def chat(payload: ChatRequest, service: ChatService = Depends(get_chat_service)) -> ChatResponse:
    """Answer a visitor message through the RAG + LLM pipeline.

    Maps infrastructure failures to stable HTTP errors: a missing FAISS
    index yields 503; any other pipeline error yields 502. Successful
    replies carry ``handoff=True`` and a WhatsApp link when the assistant
    routes the visitor to a human.
    """
    try:
        result = service.answer(payload.message)
    except FileNotFoundError as exc:
        raise HTTPException(status_code=503, detail=str(exc)) from exc
    except Exception as exc:
        raise HTTPException(
            status_code=502,
            detail="The assistant is temporarily unavailable. Please try again shortly.",
        ) from exc

    return ChatResponse(
        answer=result.answer,
        handoff=result.handoff,
        whatsapp_url=service.settings.whatsapp_url if result.handoff else None,
        sources=result.sources,
    )
