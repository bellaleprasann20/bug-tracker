
import uuid

from datetime import datetime

from pydantic import (
    BaseModel,
    ConfigDict,
    Field,
)


class CommentCreate(BaseModel):
    issue_id: uuid.UUID

    content: str = Field(
        min_length=1,
        max_length=5000,
    )

    parent_id: uuid.UUID | None = None


class CommentUpdate(BaseModel):
    content: str = Field(
        min_length=1,
        max_length=5000,
    )


class CommentResponse(BaseModel):
    id: uuid.UUID

    issue_id: uuid.UUID

    author_id: uuid.UUID

    parent_id: uuid.UUID | None

    content: str

    created_at: datetime

    updated_at: datetime

    model_config = ConfigDict(
        from_attributes=True,
    )
