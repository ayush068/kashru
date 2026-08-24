"""Gemini-embeddings + FAISS-backed retrieval."""

import logging
import time
from dataclasses import dataclass, field
from pathlib import Path

from langchain_community.document_loaders import DirectoryLoader, TextLoader
from langchain_community.vectorstores import FAISS
from langchain_core.documents import Document
from langchain_google_genai import GoogleGenerativeAIEmbeddings
from langchain_text_splitters import RecursiveCharacterTextSplitter

from app.core.config import Settings

logger = logging.getLogger(__name__)

SUPPORTED_GLOBS = ("**/*.txt", "**/*.md")


@dataclass
class RetrievalResult:
    """Outcome of a single retrieval step, including step timings in ms."""

    context: str
    sources: list[str] = field(default_factory=list)
    embed_ms: float = 0.0
    retrieve_ms: float = 0.0
    doc_count: int = 0


def get_embeddings(settings: Settings) -> GoogleGenerativeAIEmbeddings:
    """Create Gemini API embeddings using REST transport.

    REST transport is used instead of gRPC/grpc_asyncio to avoid
    event-loop errors when the embedding client is initialized from
    an AnyIO worker thread on Render.
    """
    if not settings.gemini_api_key:
        raise ValueError("GEMINI_API_KEY is required for embeddings")

    return GoogleGenerativeAIEmbeddings(
        model=settings.embedding_model_name,
        google_api_key=settings.gemini_api_key,
        transport="rest",
    )


def load_knowledge_documents(knowledge_dir: Path) -> list[Document]:
    """Load all supported (.txt/.md) knowledge files from a directory."""
    documents: list[Document] = []

    for glob_pattern in SUPPORTED_GLOBS:
        loader = DirectoryLoader(
            str(knowledge_dir),
            glob=glob_pattern,
            loader_cls=TextLoader,
            loader_kwargs={"encoding": "utf-8"},
            show_progress=True,
        )
        documents.extend(loader.load())

    return documents


def build_faiss_index(settings: Settings) -> int:
    """Build and persist the FAISS index from the knowledge directory.

    Returns the number of chunks written.
    """
    if not settings.knowledge_dir.exists():
        raise FileNotFoundError(
            f"Knowledge folder not found: {settings.knowledge_dir}"
        )

    documents = load_knowledge_documents(settings.knowledge_dir)

    if not documents:
        raise ValueError(
            f"No .txt or .md knowledge files found in {settings.knowledge_dir}"
        )

    splitter = RecursiveCharacterTextSplitter(
        chunk_size=700,
        chunk_overlap=120,
        separators=[
            "\n## ",
            "\n### ",
            "\n\n",
            "\n",
            ". ",
            " ",
        ],
    )

    chunks = splitter.split_documents(documents)

    embeddings = get_embeddings(settings)

    vectorstore = FAISS.from_documents(
        chunks,
        embeddings,
    )

    settings.faiss_index_dir.mkdir(
        parents=True,
        exist_ok=True,
    )

    vectorstore.save_local(
        str(settings.faiss_index_dir)
    )

    logger.info(
        "FAISS index built successfully: chunks=%s model=%s",
        len(chunks),
        settings.embedding_model_name,
    )

    return len(chunks)


def load_faiss_index(
    settings: Settings,
    embeddings=None,
) -> FAISS:
    """Load a previously built FAISS index from disk.

    ``embeddings`` may be supplied to reuse an already initialized
    embedding client; otherwise one is created here.
    """
    if not settings.faiss_index_dir.exists():
        raise FileNotFoundError(
            f"FAISS index not found at {settings.faiss_index_dir}. "
            "Run: python scripts/build_index.py"
        )

    return FAISS.load_local(
        str(settings.faiss_index_dir),
        embeddings or get_embeddings(settings),
        allow_dangerous_deserialization=True,
    )


class RetrievalService:
    """Owns the Gemini embedding client and FAISS index."""

    def __init__(self, settings: Settings):
        self.settings = settings

        started = time.perf_counter()

        self.embeddings = get_embeddings(settings)

        self.vectorstore = load_faiss_index(
            settings,
            embeddings=self.embeddings,
        )

        logger.info(
            "RAG initialized: model=%s chunks=%s init_ms=%.0f",
            settings.embedding_model_name,
            getattr(self.vectorstore.index, "ntotal", "?"),
            (time.perf_counter() - started) * 1000,
        )

    def embed_query(self, query: str) -> list[float]:
        """Embed a single query string."""
        return self.embeddings.embed_query(query)

    def retrieve(
        self,
        query: str,
        k: int = 4,
    ) -> RetrievalResult:
        """Embed query, search FAISS, and return matching context."""

        embed_started = time.perf_counter()

        query_vector = self.embed_query(query)

        embed_ms = (
            time.perf_counter() - embed_started
        ) * 1000

        retrieve_started = time.perf_counter()

        docs = self.vectorstore.similarity_search_by_vector(
            query_vector,
            k=k,
        )

        retrieve_ms = (
            time.perf_counter() - retrieve_started
        ) * 1000

        context = "\n\n".join(
            doc.page_content
            for doc in docs
        )

        sources = sorted(
            {
                str(
                    doc.metadata.get(
                        "source",
                        "knowledge",
                    )
                ).replace("\\", "/")
                for doc in docs
            }
        )

        return RetrievalResult(
            context=context,
            sources=sources,
            embed_ms=embed_ms,
            retrieve_ms=retrieve_ms,
            doc_count=len(docs),
        )