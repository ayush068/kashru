"""Pydantic request/response schemas for the public chat API."""

from pydantic import BaseModel, Field


class ChatRequest(BaseModel):
    """Incoming visitor message."""

    message: str = Field(..., min_length=1, max_length=1000)


class ChatResponse(BaseModel):
    """Assistant reply returned to the widget.

    ``handoff`` is True when the visitor should be routed to a human,
    in which case ``whatsapp_url`` carries the pre-filled WhatsApp link.
    """

    answer: str
    handoff: bool
    whatsapp_url: str | None = None
    sources: list[str] = []


class ChatResult(BaseModel):
    """Internal result of one full chat turn before API serialization."""

    answer: str
    handoff: bool
    sources: list[str] = []
