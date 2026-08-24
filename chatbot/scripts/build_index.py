"""Build or refresh the FAISS index from the knowledge directory."""

import sys
from pathlib import Path

PROJECT_ROOT = Path(__file__).resolve().parents[1]
if str(PROJECT_ROOT) not in sys.path:
    sys.path.insert(0, str(PROJECT_ROOT))

from app.core.config import get_settings  # noqa: E402
from app.services.rag_service import build_faiss_index  # noqa: E402


def main():
    """Build the index and print a summary of what was written."""
    settings = get_settings()
    chunk_count = build_faiss_index(settings)
    print(f"Built FAISS index with {chunk_count} chunks at {settings.faiss_index_dir}")


if __name__ == "__main__":
    main()
