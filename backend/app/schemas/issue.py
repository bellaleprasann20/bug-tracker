
import uuid

from datetime import datetime

from pydantic import (
    BaseModel,
    ConfigDict,
    Field,
)

from app.models.issue import (
    IssueType,
    IssueStatus,
    IssuePriority,
)


class IssueCreate(BaseModel):
    title: str = Field(
        min_length=3,
        max_length=200,
    )

    description: str | None = Field(
        default=None,
        max_length=10000,
    )

    issue_type: IssueType = IssueType.BUG

    priority: IssuePriority = IssuePriority.MEDIUM

    project_id: uuid.UUID

    assignee_id: uuid.UUID | None = None

    story_points: int | None = Field(
        default=None,
        ge=0,
        le=100,
    )

    labels: list[str] = Field(
        default_factory=list,
        max_length=20,
    )

    due_date: datetime | None = None


class IssueUpdate(BaseModel):
    title: str | None = Field(
        default=None,
        min_length=3,
        max_length=200,
    )

    description: str | None = Field(
        default=None,
        max_length=10000,
    )

    issue_type: IssueType | None = None

    status: IssueStatus | None = None

    priority: IssuePriority | None = None

    assignee_id: uuid.UUID | None = None

    story_points: int | None = Field(
        default=None,
        ge=0,
        le=100,
    )

    labels: list[str] | None = Field(
        default=None,
        max_length=20,
    )

    due_date: datetime | None = None


class IssueResponse(BaseModel):
    id: uuid.UUID

    issue_key: str

    title: str

    description: str | None

    issue_type: IssueType

    status: IssueStatus

    priority: IssuePriority

    project_id: uuid.UUID

    reporter_id: uuid.UUID

    assignee_id: uuid.UUID | None

    story_points: int | None

    labels: list[str]

    due_date: datetime | None

    created_at: datetime

    updated_at: datetime

    resolved_at: datetime | None

    model_config = ConfigDict(
        from_attributes=True,
    )
