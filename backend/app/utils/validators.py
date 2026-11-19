import re
from pathlib import Path

from fastapi import HTTPException, status


ALLOWED_EXTENSIONS = {
    ".jpg",
    ".jpeg",
    ".png",
    ".gif",
    ".webp",
    ".pdf",
    ".txt",
}


def validate_email(email: str) -> str:
    normalized_email = email.strip().lower()

    pattern = r"^[^@\s]+@[^@\s]+\.[^@\s]+$"

    if not re.match(pattern, normalized_email):
        raise HTTPException(
            status_code=status.HTTP_422_UNPROCESSABLE_ENTITY,
            detail="Please provide a valid email address.",
        )

    return normalized_email


def validate_password(password: str) -> None:
    if len(password) < 8:
        raise HTTPException(
            status_code=status.HTTP_422_UNPROCESSABLE_ENTITY,
            detail="Password must contain at least 8 characters.",
        )

    if len(password) > 128:
        raise HTTPException(
            status_code=status.HTTP_422_UNPROCESSABLE_ENTITY,
            detail="Password cannot exceed 128 characters.",
        )


def validate_project_key(project_key: str) -> str:
    normalized_key = project_key.strip().upper()

    if not re.fullmatch(
        r"[A-Z][A-Z0-9]{1,19}",
        normalized_key,
    ):
        raise HTTPException(
            status_code=status.HTTP_422_UNPROCESSABLE_ENTITY,
            detail=(
                "Project key must start with a letter "
                "and contain 2 to 20 uppercase letters or numbers."
            ),
        )

    return normalized_key


def validate_issue_title(title: str) -> str:
    normalized_title = title.strip()

    if len(normalized_title) < 3:
        raise HTTPException(
            status_code=status.HTTP_422_UNPROCESSABLE_ENTITY,
            detail="Issue title must contain at least 3 characters.",
        )

    if len(normalized_title) > 200:
        raise HTTPException(
            status_code=status.HTTP_422_UNPROCESSABLE_ENTITY,
            detail="Issue title cannot exceed 200 characters.",
        )

    return normalized_title


def validate_file_extension(filename: str) -> str:
    extension = Path(filename).suffix.lower()

    if extension not in ALLOWED_EXTENSIONS:
        raise HTTPException(
            status_code=status.HTTP_415_UNSUPPORTED_MEDIA_TYPE,
            detail="This file extension is not allowed.",
        )

    return extension


def validate_page_parameters(
    page: int,
    page_size: int,
) -> tuple[int, int]:
    if page < 1:
        raise HTTPException(
            status_code=status.HTTP_422_UNPROCESSABLE_ENTITY,
            detail="Page must be at least 1.",
        )

    if page_size < 1 or page_size > 100:
        raise HTTPException(
            status_code=status.HTTP_422_UNPROCESSABLE_ENTITY,
            detail="Page size must be between 1 and 100.",
        )

    return page, page_size