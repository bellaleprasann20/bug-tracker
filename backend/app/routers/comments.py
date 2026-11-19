
from fastapi import APIRouter, HTTPException, status
from sqlalchemy import select

from app.dependencies import DatabaseSession, CurrentUser
from app.core.permissions import UserRole
from app.models.issue import Issue
from app.models.comment import Comment
from app.models.project_member import ProjectMember
from app.models.activity import Activity
from app.schemas.comment import (
    CommentCreate,
    CommentUpdate,
    CommentResponse,
)


router = APIRouter(prefix="/comments", tags=["Comments"])


def check_issue_access(db, issue, user, allow_viewer=True):
    if user.role == UserRole.ADMIN:
        return

    membership = db.scalar(
        select(ProjectMember).where(
            ProjectMember.project_id == issue.project_id,
            ProjectMember.user_id == user.id,
        )
    )

    if not membership:
        raise HTTPException(status_code=403, detail="Access denied")

    if not allow_viewer and membership.role == "viewer":
        raise HTTPException(status_code=403, detail="Read-only project access")


@router.get("/issue/{issue_id}", response_model=list[CommentResponse])
def list_comments(
    issue_id: str,
    db: DatabaseSession,
    current_user: CurrentUser,
):
    issue = db.get(Issue, issue_id)

    if not issue:
        raise HTTPException(status_code=404, detail="Issue not found")

    check_issue_access(db, issue, current_user)

    return db.scalars(
        select(Comment)
        .where(Comment.issue_id == issue.id)
        .order_by(Comment.created_at.asc())
    ).all()


@router.post(
    "/",
    response_model=CommentResponse,
    status_code=status.HTTP_201_CREATED,
)
def create_comment(
    data: CommentCreate,
    db: DatabaseSession,
    current_user: CurrentUser,
):
    issue = db.get(Issue, data.issue_id)

    if not issue:
        raise HTTPException(status_code=404, detail="Issue not found")

    check_issue_access(db, issue, current_user, allow_viewer=False)

    if data.parent_id:
        parent = db.get(Comment, data.parent_id)

        if not parent or parent.issue_id != issue.id:
            raise HTTPException(
                status_code=400,
                detail="Parent comment must belong to this issue",
            )

    comment = Comment(
        issue_id=issue.id,
        author_id=current_user.id,
        parent_id=data.parent_id,
        content=data.content,
    )

    db.add(comment)
    db.add(
        Activity(
            project_id=issue.project_id,
            issue_id=issue.id,
            actor_id=current_user.id,
            action="comment_created",
            description=f"Commented on {issue.issue_key}",
        )
    )

    db.commit()
    db.refresh(comment)

    return comment


@router.patch("/{comment_id}", response_model=CommentResponse)
def update_comment(
    comment_id: str,
    data: CommentUpdate,
    db: DatabaseSession,
    current_user: CurrentUser,
):
    comment = db.get(Comment, comment_id)

    if not comment:
        raise HTTPException(status_code=404, detail="Comment not found")

    if comment.author_id != current_user.id and current_user.role != UserRole.ADMIN:
        raise HTTPException(
            status_code=403,
            detail="You can only edit your own comments",
        )

    comment.content = data.content
    db.commit()
    db.refresh(comment)

    return comment


@router.delete("/{comment_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_comment(
    comment_id: str,
    db: DatabaseSession,
    current_user: CurrentUser,
):
    comment = db.get(Comment, comment_id)

    if not comment:
        raise HTTPException(status_code=404, detail="Comment not found")

    if comment.author_id != current_user.id and current_user.role != UserRole.ADMIN:
        raise HTTPException(
            status_code=403,
            detail="You can only delete your own comments",
        )

    db.delete(comment)
    db.commit()

    return None
