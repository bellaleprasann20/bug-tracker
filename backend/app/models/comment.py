
import uuid

from datetime import datetime, timezone

from sqlalchemy import (
    DateTime,
    ForeignKey,
    Index,
    Text,
)
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.database import Base


def utc_now():
    return datetime.now(timezone.utc)


class Comment(Base):
    __tablename__ = "comments"

    __table_args__ = (
        Index("ix_comments_issue_id", "issue_id"),
        Index("ix_comments_author_id", "author_id"),
    )

    id: Mapped[uuid.UUID] = mapped_column(
        primary_key=True,
        default=uuid.uuid4,
    )

    issue_id: Mapped[uuid.UUID] = mapped_column(
        ForeignKey("issues.id", ondelete="CASCADE"),
        nullable=False,
    )

    author_id: Mapped[uuid.UUID] = mapped_column(
        ForeignKey("users.id", ondelete="RESTRICT"),
        nullable=False,
    )

    parent_id: Mapped[uuid.UUID | None] = mapped_column(
        ForeignKey("comments.id", ondelete="CASCADE"),
        nullable=True,
    )

    content: Mapped[str] = mapped_column(
        Text,
        nullable=False,
    )

    created_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True),
        default=utc_now,
        nullable=False,
    )

    updated_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True),
        default=utc_now,
        onupdate=utc_now,
        nullable=False,
    )

    issue = relationship(
        "Issue",
        back_populates="comments",
    )

    author = relationship(
        "User",
        back_populates="comments",
    )

    parent = relationship(
        "Comment",
        remote_side="Comment.id",
        back_populates="replies",
    )

    replies = relationship(
        "Comment",
        back_populates="parent",
        cascade="all, delete-orphan",
        single_parent=True,
    )

    def __repr__(self):
        return f"<Comment {self.id}>"
