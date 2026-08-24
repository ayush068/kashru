"""Shared fixtures: a deterministic ChatService stub for offline API tests."""

from app.core.config import get_settings
from app.models.schemas import ChatResult

HANDOFF_TEXT = "Let's get you an exact quote — I'll connect you with our team."


class FakeChatService:
    """ChatService stand-in returning canned results.

    Keeps tests offline: no embeddings model, no FAISS index, no API keys.
    Wire it into the app with ``app.dependency_overrides[get_chat_service]``.
    """

    def __init__(self, result: ChatResult | None = None, error: Exception | None = None):
        self.result = result or ChatResult(
            answer="Kashru Technologies builds web and mobile applications.",
            handoff=False,
            sources=["knowledge/kashru_site.md"],
        )
        self.error = error
        self.settings = get_settings()
        self.calls: list[str] = []

    def answer(self, message: str) -> ChatResult:
        self.calls.append(message)
        if self.error:
            raise self.error
        return self.result
