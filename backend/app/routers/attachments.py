
import uuid
from pathlib import Path

from fastapi import APIRouter, HTTPException, UploadFile, File, status
from fastapi.responses import FileResponse
from sqlalchemy import select

from app.dependencies import DatabaseSession, CurrentUser
from app.core.permissions import UserRole
from app.models.issue import Issue
from app.models.project_member import ProjectMember
from app.models.attachment import Attachment
from app.schemas.attachment import AttachmentResponse


router = APIRouter(prefix="/attachments", tags=["Attachments"])

UPLOAD_DIR = Path(__file__).resolve().parents[2] / "uploads"
MAX_FILE_SIZE = 10 * 1024 * 1024

ALLOWED_TYPES = {
    "image/png",
    "image/jpeg",
    "image/gif",
    "application/pdf",
    "text/plain",
}


def check_upload_access(db, issue, user):
    if user.role == UserRole.ADMIN:
        return

    membership = db.scalar(
        select(ProjectMember).where(
            ProjectMember.project_id == issue.project_id,
            ProjectMember.user_id == user.id,
        )
    )

    if not membership or membership.role == "viewer":
        raise HTTPException(status_code=403, detail="Upload access denied")


@router.post(
    "/issue/{issue_id}",
    response_model=AttachmentResponse,
    status_code=status.HTTP_201_CREATED,
)
async def upload_attachment(
    issue_id: str,
    db: DatabaseSession,
    current_user: CurrentUser,
    file: UploadFile = File(...),
):
    issue = db.get(Issue, issue_id)

    if not issue:
        raise HTTPException(status_code=404, detail="Issue not found")

    check_upload_access(db, issue, current_user)

    if file.content_type not in ALLOWED_TYPES:
        raise HTTPException(
            status_code=415,
            detail="File type is not supported",
        )

    content = await file.read()

    if not content:
        raise HTTPException(status_code=400, detail="Empty file")

    if len(content) > MAX_FILE_SIZE:
        raise HTTPException(
            status_code=413,
            detail="Maximum file size is 10 MB",
        )

    UPLOAD_DIR.mkdir(parents=True, exist_ok=True)

    extension = Path(file.filename or "").suffix.lower()
    stored_name = f"{uuid.uuid4().hex}{extension}"
    destination = UPLOAD_DIR / stored_name

    destination.write_bytes(content)

    attachment = Attachment(
        issue_id=issue.id,
        uploaded_by_id=current_user.id,
        original_filename=Path(file.filename or "upload").name,
        stored_filename=stored_name,
        storage_path=str(destination),
        content_type=file.content_type,
        file_size=len(content),
    )

    db.add(attachment)
    db.commit()
    db.refresh(attachment)

    return attachment


@router.get(
    "/issue/{issue_id}",
    response_model=list[AttachmentResponse],
)
def list_attachments(
    issue_id: str,
    db: DatabaseSession,
    current_user: CurrentUser,
):
    issue = db.get(Issue, issue_id)

    if not issue:
        raise HTTPException(status_code=404, detail="Issue not found")

    if current_user.role != UserRole.ADMIN:
        membership = db.scalar(
            select(ProjectMember).where(
                ProjectMember.project_id == issue.project_id,
                ProjectMember.user_id == current_user.id,
            )
        )
        if not membership:
            raise HTTPException(status_code=403, detail="Access denied")

    return db.scalars(
        select(Attachment)
        .where(Attachment.issue_id == issue.id)
        .order_by(Attachment.uploaded_at.desc())
    ).all()


@router.get("/{attachment_id}/download")
def download_attachment(
    attachment_id: str,
    db: DatabaseSession,
    current_user: CurrentUser,
):
    attachment = db.get(Attachment, attachment_id)

    if not attachment:
        raise HTTPException(status_code=404, detail="Attachment not found")

    issue = db.get(Issue, attachment.issue_id)

    if not issue:
        raise HTTPException(status_code=404, detail="Issue not found")

    if current_user.role != UserRole.ADMIN:
        membership = db.scalar(
            select(ProjectMember).where(
                ProjectMember.project_id == issue.project_id,
                ProjectMember.user_id == current_user.id,
            )
        )
        if not membership:
            raise HTTPException(status_code=403, detail="Access denied")

    path = Path(attachment.storage_path).resolve()

    if path.parent != UPLOAD_DIR.resolve() or not path.is_file():
        raise HTTPException(status_code=404, detail="Stored file not found")

    return FileResponse(
        path,
        media_type=attachment.content_type,
        filename=attachment.original_filename,
    )
