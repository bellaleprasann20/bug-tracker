from uuid import UUID

from sqlalchemy import func, select
from sqlalchemy.orm import Session

from app.models.comment import Comment


def get_by_id(
    db: Session,
    comment_id: UUID,
) -> Comment | None:
    return db.get(Comment, comment_id)


def get_by_issue(
    db: Session,
    issue_id: UUID,
) -> list[Comment]:
    statement = (
        select(Comment)
        .where(Comment.issue_id == issue_id)
        .order_by(Comment.created_at.asc())
    )
    return list(db.scalars(statement).all())


def get_replies(
    db: Session,
    parent_id: UUID,
) -> list[Comment]:
    statement = (
        select(Comment)
        .where(Comment.parent_id == parent_id)
        .order_by(Comment.created_at.asc())
    )
    return list(db.scalars(statement).all())


def count_by_issue(
    db: Session,
    issue_id: UUID,
) -> int:
    return db.scalar(
        select(func.count())
        .select_from(Comment)
        .where(Comment.issue_id == issue_id)
    ) or 0


def create(db: Session, comment: Comment) -> Comment:
    db.add(comment)
    db.flush()
    return comment


def update(db: Session, comment: Comment) -> Comment:
    db.add(comment)
    db.flush()
    return comment


def delete(db: Session, comment: Comment) -> None:
    db.delete(comment)
    db.flush()