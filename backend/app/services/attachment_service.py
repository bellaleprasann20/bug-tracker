import logging
import os
from pathlib import Path
from uuid import UUID, uuid4

from fastapi import HTTPException, UploadFile, status
from sqlalchemy.orm import Session

from app.config import settings
from app.models.attachment import Attachment
from app.models.issue import Issue


logger = logging.getLogger(__name__)

UPLOAD_DIR = Path("uploads")
MAX_FILE_SIZE = 10 * 1024 * 1024  # 10 MB

ALLOWED_CONTENT_TYPES = {
    "image/jpeg",
    "image/png",
    "image/gif",
    "image/webp",
    "application/pdf",
    "text/plain",
}


async def upload_attachment(
    db: Session,
    issue_id: UUID,
    uploaded_by_id: UUID,
    file: UploadFile,
) -> Attachment:
    issue = db.get(Issue, issue_id)

    if not issue:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Issue not found.",
        )

    content_type = file.content_type or "application/octet-stream"

    if content_type not in ALLOWED_CONTENT_TYPES:
        raise HTTPException(
            status_code=status.HTTP_415_UNSUPPORTED_MEDIA_TYPE,
            detail="This file type is not allowed.",
        )

    original_filename = Path(
        file.filename or "attachment"
    ).name

    if not original_filename:
        original_filename = "attachment"

    file_content = await file.read()

    if not file_content:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="The uploaded file is empty.",
        )

    if len(file_content) > MAX_FILE_SIZE:
        raise HTTPException(
            status_code=status.HTTP_413_REQUEST_ENTITY_TOO_LARGE,
            detail="File size must not exceed 10 MB.",
        )

    UPLOAD_DIR.mkdir(parents=True, exist_ok=True)

    extension = Path(original_filename).suffix.lower()
    stored_filename = f"{uuid4().hex}{extension}"
    storage_path = UPLOAD_DIR / stored_filename

    try:
        storage_path.write_bytes(file_content)

        attachment = Attachment(
            issue_id=issue_id,
            uploaded_by_id=uploaded_by_id,
            original_filename=original_filename,
            stored_filename=stored_filename,
            storage_path=str(storage_path),
            content_type=content_type,
            file_size=len(file_content),
        )

        db.add(attachment)
        db.commit()
        db.refresh(attachment)

        return attachment

    except Exception:
        db.rollback()

        if storage_path.exists():
            storage_path.unlink()

        logger.exception("Attachment upload failed.")
        raise

    finally:
        await file.close()


def get_issue_attachments(
    db: Session,
    issue_id: UUID,
) -> list[Attachment]:
    return list(
        db.query(Attachment)
        .filter(Attachment.issue_id == issue_id)
        .order_by(Attachment.uploaded_at.desc())
        .all()
    )


def get_attachment_by_id(
    db: Session,
    attachment_id: UUID,
) -> Attachment:
    attachment = db.get(Attachment, attachment_id)

    if not attachment:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Attachment not found.",
        )

    return attachment


def delete_attachment(
    db: Session,
    attachment_id: UUID,
    current_user_id: UUID,
    is_admin: bool = False,
) -> None:
    attachment = get_attachment_by_id(
        db,
        attachment_id,
    )

    if (
        attachment.uploaded_by_id != current_user_id
        and not is_admin
    ):
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="You cannot delete this attachment.",
        )

    try:
        file_path = Path(attachment.storage_path)

        if file_path.exists():
            file_path.unlink()

        db.delete(attachment)
        db.commit()

    except Exception:
        db.rollback()
        logger.exception("Attachment deletion failed.")
        raise