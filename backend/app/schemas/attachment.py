
import uuid

from datetime import datetime

from pydantic import (
    BaseModel,
    ConfigDict,
    Field,
)


class AttachmentResponse(BaseModel):
    id: uuid.UUID

    issue_id: uuid.UUID

    uploaded_by_id: uuid.UUID

    original_filename: str

    stored_filename: str

    storage_path: str

    content_type: str

    file_size: int = Field(
        ge=0,
    )

    uploaded_at: datetime

    model_config = ConfigDict(
        from_attributes=True,
    )
