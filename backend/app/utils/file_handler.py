import logging
from pathlib import Path
from uuid import uuid4

from fastapi import HTTPException, UploadFile, status

logger = logging.getLogger(__name__)

UPLOAD_DIR = Path("uploads").resolve()
MAX_FILE_SIZE = 10 * 1024 * 1024  # 10 MB

ALLOWED_CONTENT_TYPES = {
    "image/jpeg",
    "image/png",
    "image/gif",
    "image/webp",
    "application/pdf",
    "text/plain",
}


def validate_file_type(content_type: str | None) -> str:
    if not content_type or content_type not in ALLOWED_CONTENT_TYPES:
        raise HTTPException(
            status_code=status.HTTP_415_UNSUPPORTED_MEDIA_TYPE,
            detail="This file type is not allowed.",
        )

    return content_type


def validate_file_size(file_size: int) -> None:
    if file_size <= 0:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="The uploaded file is empty.",
        )

    if file_size > MAX_FILE_SIZE:
        raise HTTPException(
            status_code=status.HTTP_413_REQUEST_ENTITY_TOO_LARGE,
            detail="File size must not exceed 10 MB.",
        )


def generate_stored_filename(original_filename: str) -> str:
    extension = Path(original_filename).suffix.lower()

    # Do not allow unusually long extensions.
    if len(extension) > 15:
        extension = ""

    return f"{uuid4().hex}{extension}"


def get_safe_upload_path(stored_filename: str) -> Path:
    filename = Path(stored_filename).name

    if filename != stored_filename or filename in {"", ".", ".."}:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Invalid filename.",
        )

    path = (UPLOAD_DIR / filename).resolve()

    if path.parent != UPLOAD_DIR:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Invalid file path.",
        )

    return path


async def save_upload_file(
    file: UploadFile,
) -> tuple[str, str, int, str]:
    content_type = validate_file_type(file.content_type)

    original_filename = Path(
        file.filename or "attachment"
    ).name

    if not original_filename:
        original_filename = "attachment"

    content = await file.read()

    validate_file_size(len(content))

    stored_filename = generate_stored_filename(
        original_filename
    )

    file_path = get_safe_upload_path(stored_filename)

    try:
        UPLOAD_DIR.mkdir(parents=True, exist_ok=True)
        file_path.write_bytes(content)

        return (
            original_filename,
            stored_filename,
            len(content),
            str(file_path),
        )

    except OSError:
        logger.exception("Unable to save uploaded file.")

        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Unable to save the uploaded file.",
        )

    finally:
        await file.close()


def delete_stored_file(stored_filename: str) -> bool:
    file_path = get_safe_upload_path(stored_filename)

    try:
        if not file_path.exists():
            return False

        file_path.unlink()
        return True

    except OSError:
        logger.exception(
            "Unable to delete stored file: %s",
            stored_filename,
        )
        raise


def get_stored_file_path(stored_filename: str) -> Path:
    file_path = get_safe_upload_path(stored_filename)

    if not file_path.is_file():
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="File not found.",
        )

    return file_path