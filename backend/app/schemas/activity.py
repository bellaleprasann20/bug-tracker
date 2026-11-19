
import uuid

from datetime import datetime

from pydantic import (
    BaseModel,
    ConfigDict,
    Field,
)


class ActivityResponse(BaseModel):
    id: uuid.UUID

    project_id: uuid.UUID

    issue_id: uuid.UUID | None

    actor_id: uuid.UUID | None

    action: str

    description: str

    extra_data: dict = Field(
        default_factory=dict,
    )

    created_at: datetime

    model_config = ConfigDict(
        from_attributes=True,
    )
