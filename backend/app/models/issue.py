
import uuid

from datetime import datetime, timezone

from sqlalchemy import (
    DateTime,
    Enum as SQLAlchemyEnum,
    ForeignKey,
    Index,
    Integer,
    JSON,
    String,
    Text,
)
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.database import Base


def utc_now():
    return datetime.now(timezone.utc)


class IssueType(str, __import__("enum").Enum):
    BUG = "bug"
    TASK = "task"
    FEATURE = "feature"


class IssueStatus(str, __import__("enum").Enum):
    TODO = "todo"
    IN_PROGRESS = "in_progress"
    IN_REVIEW = "in_review"
    DONE = "done"


class IssuePriority(str, __import__("enum").Enum):
    LOW = "low"
    MEDIUM = "medium"
    HIGH = "high"
    CRITICAL = "critical"


class Issue(Base):
    __tablename__ = "issues"

    __table_args__ = (
        Index("ix_issues_project_id", "project_id"),
        Index("ix_issues_status", "status"),
        Index("ix_issues_assignee_id", "assignee_id"),
        Index("ix_issues_reporter_id", "reporter_id"),
        Index(
            "ix_issues_project_status",
            "project_id",
            "status",
        ),
    )

    id: Mapped[uuid.UUID] = mapped_column(
        primary_key=True,
        default=uuid.uuid4,
    )

    issue_key: Mapped[str] = mapped_column(
        String(40),
        unique=True,
        nullable=False,
    )

    title: Mapped[str] = mapped_column(
        String(200),
        nullable=False,
    )

    description: Mapped[str | None] = mapped_column(
        Text,
        nullable=True,
    )

    issue_type: Mapped[IssueType] = mapped_column(
        SQLAlchemyEnum(
            IssueType,
            name="issue_type",
            values_callable=lambda enum: [
                item.value for item in enum
            ],
        ),
        default=IssueType.BUG,
        nullable=False,
    )

    status: Mapped[IssueStatus] = mapped_column(
        SQLAlchemyEnum(
            IssueStatus,
            name="issue_status",
            values_callable=lambda enum: [
                item.value for item in enum
            ],
        ),
        default=IssueStatus.TODO,
        nullable=False,
    )

    priority: Mapped[IssuePriority] = mapped_column(
        SQLAlchemyEnum(
            IssuePriority,
            name="issue_priority",
            values_callable=lambda enum: [
                item.value for item in enum
            ],
        ),
        default=IssuePriority.MEDIUM,
        nullable=False,
    )

    project_id: Mapped[uuid.UUID] = mapped_column(
        ForeignKey("projects.id", ondelete="CASCADE"),
        nullable=False,
    )

    reporter_id: Mapped[uuid.UUID] = mapped_column(
        ForeignKey("users.id", ondelete="RESTRICT"),
        nullable=False,
    )

    assignee_id: Mapped[uuid.UUID | None] = mapped_column(
        ForeignKey("users.id", ondelete="SET NULL"),
        nullable=True,
    )

    story_points: Mapped[int | None] = mapped_column(
        Integer,
        nullable=True,
    )

    labels: Mapped[list] = mapped_column(
        JSON,
        default=list,
        nullable=False,
    )

    due_date: Mapped[datetime | None] = mapped_column(
        DateTime(timezone=True),
        nullable=True,
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

    resolved_at: Mapped[datetime | None] = mapped_column(
        DateTime(timezone=True),
        nullable=True,
    )

    project = relationship(
        "Project",
        back_populates="issues",
    )

    reporter = relationship(
        "User",
        back_populates="reported_issues",
        foreign_keys=[reporter_id],
    )

    assignee = relationship(
        "User",
        back_populates="assigned_issues",
        foreign_keys=[assignee_id],
    )

    comments = relationship(
        "Comment",
        back_populates="issue",
        cascade="all, delete-orphan",
    )

    attachments = relationship(
        "Attachment",
        back_populates="issue",
        cascade="all, delete-orphan",
    )

    activities = relationship(
        "Activity",
        back_populates="issue",
    )

    def __repr__(self):
        return f"<Issue {self.issue_key}>"
