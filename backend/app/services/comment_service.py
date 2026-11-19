from uuid import UUID

from fastapi import HTTPException, status
from sqlalchemy import select
from sqlalchemy.orm import Session

from app.models.comment import Comment
from app.models.issue import Issue
from app.schemas.comment import CommentCreate, CommentUpdate


def get_comment_by_id(
    db: Session,
    comment_id: UUID,
) -> Comment:
    comment = db.get(Comment, comment_id)

    if not comment:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Comment not found.",
        )

    return comment


def create_comment(
    db: Session,
    comment_data: CommentCreate,
    author_id: UUID,
) -> Comment:
    issue = db.get(Issue, comment_data.issue_id)

    if not issue:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Issue not found.",
        )

    if comment_data.parent_id:
        parent = get_comment_by_id(
            db,
            comment_data.parent_id,
        )

        if parent.issue_id != issue.id:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="A reply must belong to the same issue as its parent comment.",
            )

    comment = Comment(
        issue_id=comment_data.issue_id,
        author_id=author_id,
        parent_id=comment_data.parent_id,
        content=comment_data.content,
    )

    db.add(comment)
    db.commit()
    db.refresh(comment)

    return comment


def get_issue_comments(
    db: Session,
    issue_id: UUID,
) -> list[Comment]:
    issue = db.get(Issue, issue_id)

    if not issue:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Issue not found.",
        )

    return list(
        db.scalars(
            select(Comment)
            .where(Comment.issue_id == issue_id)
            .order_by(Comment.created_at.asc())
        ).all()
    )


def update_comment(
    db: Session,
    comment_id: UUID,
    comment_data: CommentUpdate,
    current_user_id: UUID,
    is_admin: bool = False,
) -> Comment:
    comment = get_comment_by_id(db, comment_id)

    if comment.author_id != current_user_id and not is_admin:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="You can only edit your own comments.",
        )

    comment.content = comment_data.content

    db.commit()
    db.refresh(comment)

    return comment


def delete_comment(
    db: Session,
    comment_id: UUID,
    current_user_id: UUID,
    is_admin: bool = False,
) -> None:
    comment = get_comment_by_id(db, comment_id)

    if comment.author_id != current_user_id and not is_admin:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="You can only delete your own comments.",
        )

    db.delete(comment)
    db.commit()