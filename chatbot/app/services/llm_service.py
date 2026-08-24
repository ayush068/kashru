"""LLM orchestration: prompt building, Groq primary + Gemini fallback chain,
handoff detection, and response truncation safety nets."""

import logging
import time
from functools import lru_cache

from langchain_core.messages import HumanMessage, SystemMessage
from langchain_google_genai import ChatGoogleGenerativeAI
from langchain_groq import ChatGroq

from app.core.config import Settings, get_settings
from app.models.schemas import ChatResult
from app.services.rag_service import RetrievalService

logger = logging.getLogger(__name__)

MAX_OUTPUT_TOKENS = 400

_SENTENCE_ENDINGS = ".!?"

HANDOFF_TEXT = "Let's get you an exact quote — I'll connect you with our team."

HANDOFF_KEYWORDS = (
    "price",
    "pricing",
    "cost",
    "budget",
    "quote",
    "estimate",
    "package",
    "timeline",
    "deadline",
    "how long",
    "start a project",
    "start project",
    "hire",
    "book",
    "call",
    "contact",
    "proposal",
)

SYSTEM_PROMPT = """You are Kashru Technologies' website assistant.
Answer only from the provided context. Keep the reply friendly, professional,
and short: 2 to 4 sentences maximum.

If the answer is not in the context, say you do not have that detail yet and
offer to connect the visitor with the team. Do not guess.

Never invent prices, timelines, package details, client names, or guarantees.
For pricing, timelines, or project-start requests, say:
"Let's get you an exact quote — I'll connect you with our team."
"""


class ChatService:
    """End-to-end chat pipeline: retrieval -> LLM generation -> handoff rules.

    Tries Groq first (fast path), then Gemini models as rate-limit/outage
    fallbacks. Answers that hit the token limit are trimmed back to the
    last complete sentence so replies never end mid-word.
    """

    def __init__(self, settings: Settings):
        self.settings = settings
        self.retrieval = RetrievalService(settings)

    def _llms(self):
        """Yield configured providers in priority order (Groq, then Gemini)."""
        if self.settings.groq_api_key:
            yield ChatGroq(
                api_key=self.settings.groq_api_key,
                model=self.settings.groq_model,
                temperature=0.2,
                max_tokens=MAX_OUTPUT_TOKENS,
            )
        if self.settings.gemini_api_key:
            gemini_models = [
                self.settings.gemini_model,
                "gemini-flash-latest",
                "gemini-3.5-flash",
            ]
            for model in dict.fromkeys(gemini_models):
                yield ChatGoogleGenerativeAI(
                    google_api_key=self.settings.gemini_api_key,
                    model=model,
                    max_output_tokens=MAX_OUTPUT_TOKENS,
                )

    def _handoff_response(self, sources: list[str]) -> ChatResult:
        """Fixed routing reply for pricing/timeline/contact style messages."""
        return ChatResult(answer=HANDOFF_TEXT, handoff=True, sources=sources)

    def _looks_like_handoff(self, message: str) -> bool:
        """Return True if the visitor message matches a handoff keyword."""
        lowered = message.lower()
        return any(keyword in lowered for keyword in HANDOFF_KEYWORDS)

    def answer(self, message: str) -> ChatResult:
        """Produce a full assistant reply for one visitor message.

        Short-circuits to a WhatsApp handoff for pricing/contact intents;
        otherwise retrieves knowledge-base context, generates via the
        provider chain, and guards against truncated completions. Raises
        the last provider error when every provider fails.
        """
        clean_message = message.strip()
        if not clean_message:
            return ChatResult(
                answer="Ask me about Kashru's services, process, or company details.",
                handoff=False,
                sources=[],
            )

        if self._looks_like_handoff(clean_message):
            return self._handoff_response(sources=[])

        request_started = time.perf_counter()
        retrieval = self.retrieval.retrieve(clean_message)

        prompt = (
            f"Context:\n{retrieval.context}\n\n"
            f"Visitor question: {clean_message}\n\n"
            "Short answer:"
        )

        last_error: Exception | None = None
        for llm in self._llms():
            try:
                llm_started = time.perf_counter()
                response = llm.invoke(
                    [SystemMessage(content=SYSTEM_PROMPT), HumanMessage(content=prompt)]
                )
                llm_ms = (time.perf_counter() - llm_started) * 1000
                logger.info(
                    "LLM call succeeded: provider=%s model=%s latency_ms=%.0f",
                    type(llm).__name__,
                    getattr(llm, "model_name", "?"),
                    llm_ms,
                )

                answer_text = str(response.content).strip()
                if not answer_text:
                    continue

                if _is_truncated(response):
                    answer_text = _trim_to_complete_sentence(answer_text)
                    if not answer_text:
                        continue

                logger.info(
                    "Chat request completed: embed_ms=%.1f retrieve_ms=%.1f "
                    "llm_ms=%.0f total_ms=%.0f docs=%d",
                    retrieval.embed_ms,
                    retrieval.retrieve_ms,
                    llm_ms,
                    (time.perf_counter() - request_started) * 1000,
                    retrieval.doc_count,
                )

                return ChatResult(
                    answer=answer_text,
                    handoff=_contains_handoff_intent(answer_text),
                    sources=retrieval.sources,
                )
            except Exception as exc:
                logger.warning(
                    "LLM call failed: provider=%s model=%s after %.0fms error=%s",
                    type(llm).__name__,
                    getattr(llm, "model_name", "?"),
                    (time.perf_counter() - llm_started) * 1000,
                    exc,
                )
                last_error = exc
                if _is_rate_limit_error(exc):
                    continue

        if last_error:
            raise last_error

        return self._no_provider_response(retrieval.sources)

    def _no_provider_response(self, sources: list[str]) -> ChatResult:
        """Fallback reply shown when no AI provider is configured."""
        return ChatResult(
            answer=(
                "I do not have an AI provider configured yet. "
                "Please add a Groq or Gemini API key and try again."
            ),
            handoff=True,
            sources=sources,
        )


def _is_truncated(response) -> bool:
    """Detect responses cut off by the provider's output-token limit.

    Checks finish_reason metadata from both Groq ("length") and
    Gemini ("MAX_TOKENS" / "max_output_tokens") style responses.
    """
    metadata = getattr(response, "response_metadata", None) or {}
    finish_reason = str(metadata.get("finish_reason") or "").lower()
    if not finish_reason:
        reasons = metadata.get("finish_reasons") or []
        if isinstance(reasons, (list, tuple)) and reasons:
            finish_reason = str(reasons[0]).lower()
    return finish_reason in {"length", "max_tokens", "max_output_tokens"}


def _trim_to_complete_sentence(text: str) -> str:
    """Trim text back to its last complete sentence; empty if none exists.

    Used as a safety net so token-limited replies never end mid-word.
    """
    trimmed = text.strip()
    if not trimmed:
        return ""
    if trimmed[-1] in _SENTENCE_ENDINGS:
        return trimmed

    last_complete = -1
    for index, char in enumerate(trimmed):
        if char in _SENTENCE_ENDINGS and (
            index + 1 == len(trimmed)
            or trimmed[index + 1].isspace()
            or trimmed[index + 1] in "\"')"
        ):
            last_complete = index
    if last_complete != -1:
        candidate = trimmed[: last_complete + 1].strip()
        if candidate:
            return candidate
    return ""


def _is_rate_limit_error(exc: Exception) -> bool:
    """Heuristically detect provider rate-limit errors worth retrying."""
    text = str(exc).lower()
    status_code = getattr(exc, "status_code", None)
    return status_code == 429 or "rate limit" in text or "429" in text


def _contains_handoff_intent(answer: str) -> bool:
    """Return True when the generated answer itself offers a team handoff."""
    lowered = answer.lower()
    return (
        "exact quote" in lowered
        or "connect you with our team" in lowered
        or "do not have that detail" in lowered
        or "don't have that detail" in lowered
    )


@lru_cache
def get_chat_service() -> ChatService:
    """Return the process-wide ChatService singleton.

    Loaded lazily on first request, or eagerly by the app lifespan
    warm-up. FastAPI resolves this via Depends() in the chat route;
    tests override it with app.dependency_overrides.
    """
    return ChatService(get_settings())
