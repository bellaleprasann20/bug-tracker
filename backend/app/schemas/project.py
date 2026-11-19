
import uuid

from datetime import datetime

from pydantic import (
    BaseModel,
    ConfigDict,
    Field,
)


class ProjectCreate(BaseModel):
    name: str = Field(
        min_length=2,
        max_length=150,
    )

    key: str = Field(
        min_length=2,
        max_length=20,
        pattern=r"^[A-Z][A-Z0-9]*$",
    )

    description: str | None = Field(
        default=None,
        max_length=5000,
    )


class ProjectUpdate(BaseModel):
    name: str | None = Field(
        default=None,
        min_length=2,
        max_length=150,
    )

    description: str | None = Field(
        default=None,
        max_length=5000,
    )

    status: str | None = Field(
        default=None,
        pattern=r"^(active|archived|completed)$",
    )


class ProjectResponse(BaseModel):
    id: uuid.UUID

    name: str

    key: str

    description: str | None

    status: str

    owner_id: uuid.UUID

    created_at: datetime

    updated_at: datetime

    model_config = ConfigDict(
        from_attributes=True,
    )


class ProjectMemberCreate(BaseModel):
    user_id: uuid.UUID

    role: str = Field(
        default="developer",
        pattern=r"^(admin|developer|viewer)$",
    )


class ProjectMemberResponse(BaseModel):
    id: uuid.UUID

    project_id: uuid.UUID

    user_id: uuid.UUID

    role: str

    joined_at: datetime

    model_config = ConfigDict(
        from_attributes=True,
    )
