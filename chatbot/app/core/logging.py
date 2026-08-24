"""Application-wide logging configuration."""

import logging

LOG_FORMAT = "%(asctime)s %(levelname)-8s %(name)s - %(message)s"
LOG_DATE_FORMAT = "%Y-%m-%d %H:%M:%S"


def setup_logging(level: int = logging.INFO) -> None:
    """Configure root logging once with a consistent structured format.

    Safe to call multiple times; later calls keep the existing handlers.
    All timing instrumentation logs (embed_ms/retrieve_ms/llm_ms/total_ms)
    flow through this setup from app.services modules.
    """
    logging.basicConfig(level=level, format=LOG_FORMAT, datefmt=LOG_DATE_FORMAT)
