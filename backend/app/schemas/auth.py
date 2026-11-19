
from pydantic import BaseModel, ConfigDict, EmailStr, Field


class LoginRequest(BaseModel):
    email: EmailStr

    password: str = Field(
        min_length=8,
        max_length=128,
    )


class TokenResponse(BaseModel):
    access_token: str

    token_type: str = "bearer"

    expires_in: int


class TokenData(BaseModel):
    user_id: str

    model_config = ConfigDict(
        extra="ignore",
    )
