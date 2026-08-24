"""API tests: health check and /api/v1/chat happy + handoff paths."""

from fastapi.testclient import TestClient

from app.main import app
from app.models.schemas import ChatResult
from app.services.llm_service import get_chat_service
from tests.conftest import HANDOFF_TEXT, FakeChatService

HANDOFF_REPLY = "Let's get you an exact quote — I'll connect you with our team."


def _make_client(fake: FakeChatService) -> TestClient:
    """Build a TestClient with ``fake`` wired in place of the real service."""
    app.dependency_overrides[get_chat_service] = lambda: fake
    return TestClient(app)


def test_health_check_returns_ok():
    """GET /health responds 200 with the ok flag."""
    fake = FakeChatService()
    client = _make_client(fake)
    response = client.get("/health")
    assert response.status_code == 200
    assert response.json() == {"ok": True}


def test_chat_normal_answer():
    """POST /api/v1/chat returns the assistant answer without a handoff."""
    fake = FakeChatService()
    client = _make_client(fake)

    response = client.post(
        "/api/v1/chat",
        json={"message": "What services does Kashru offer?"},
    )

    assert response.status_code == 200
    data = response.json()
    assert data["answer"] == "Kashru Technologies builds web and mobile applications."
    assert data["handoff"] is False
    assert data["whatsapp_url"] is None
    assert data["sources"] == ["knowledge/kashru_site.md"]
    assert fake.calls == ["What services does Kashru offer?"]


def test_chat_handoff_includes_whatsapp_url():
    """Handoff replies carry the pre-filled WhatsApp routing link."""
    fake = FakeChatService(
        result=ChatResult(answer=HANDOFF_TEXT, handoff=True, sources=[])
    )
    client = _make_client(fake)

    response = client.post("/api/v1/chat", json={"message": "how much for a website?"})

    assert response.status_code == 200
    data = response.json()
    assert data["answer"] == HANDOFF_TEXT
    assert data["handoff"] is True
    assert data["whatsapp_url"] == fake.settings.whatsapp_url


def test_chat_rejects_empty_message():
    """Blank messages fail request validation with 422."""
    fake = FakeChatService()
    client = _make_client(fake)
    response = client.post("/api/v1/chat", json={"message": ""})
    assert response.status_code == 422
