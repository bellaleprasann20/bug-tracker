
import logging
import sys

from app.config import settings


def setup_logging() -> None:
    """Configure application-wide logging."""

    log_level = (
        logging.DEBUG if settings.DEBUG else logging.INFO
    )

    logging.basicConfig(
        level=log_level,
        format=(
            "%(asctime)s | "
            "%(levelname)s | "
            "%(name)s | "
            "%(message)s"
        ),
        handlers=[
            logging.StreamHandler(sys.stdout),
        ],
        force=True,
    )

    logging.getLogger("sqlalchemy.engine").setLevel(
        logging.WARNING
    )

    logging.getLogger("uvicorn.access").setLevel(
        logging.INFO
    )
