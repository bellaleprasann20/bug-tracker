
from fastapi import APIRouter, HTTPException, status
from sqlalchemy import select

from app.dependencies import DatabaseSession, CurrentUser
from app.core.security import hash_password
from app.core.permissions import UserRole
from app.models.user import User
from app.schemas.user import UserUpdate, UserResponse


router = APIRouter(prefix="/users", tags=["Users"])


def require_admin(user: User):
    if user.role != UserRole.ADMIN:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Admin access required",
        )


# Get all users (Admin only).
@router.get("/", response_model=list[UserResponse])
def list_users(
    db: DatabaseSession,
    current_user: CurrentUser,
):
    require_admin(current_user)

    return db.scalars(
        select(User).order_by(User.created_at.desc())
    ).all()


# Get the currently logged-in user's profile.
@router.get("/me", response_model=UserResponse)
def get_my_profile(
    current_user: CurrentUser,
):
    return current_user


# Get a specific user (Admin only).
@router.get("/{user_id}", response_model=UserResponse)
def get_user(
    user_id: str,
    db: DatabaseSession,
    current_user: CurrentUser,
):
    require_admin(current_user)

    user = db.get(User, user_id)

    if not user:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="User not found",
        )

    return user


# Update the currently logged-in user's profile.
@router.patch("/me", response_model=UserResponse)
def update_my_profile(
    data: UserUpdate,
    db: DatabaseSession,
    current_user: CurrentUser,
):
    updates = data.model_dump(exclude_unset=True)

    # Users cannot change their own role or account status.
    updates.pop("role", None)
    updates.pop("is_active", None)

    if "password" in updates:
        updates["hashed_password"] = hash_password(
            updates.pop("password")
        )

    if "email" in updates:
        existing = db.scalar(
            select(User).where(
                User.email == updates["email"],
                User.id != current_user.id,
            )
        )

        if existing:
            raise HTTPException(
                status_code=status.HTTP_409_CONFLICT,
                detail="Email is already in use",
            )

    for field, value in updates.items():
        setattr(current_user, field, value)

    db.commit()
    db.refresh(current_user)

    return current_user


# Activate or deactivate a user (Admin only).
@router.patch("/{user_id}/status", response_model=UserResponse)
def update_user_status(
    user_id: str,
    is_active: bool,
    db: DatabaseSession,
    current_user: CurrentUser,
):
    require_admin(current_user)

    user = db.get(User, user_id)

    if not user:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="User not found",
        )

    if user.id == current_user.id and not is_active:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="You cannot deactivate your own account",
        )

    user.is_active = is_active

    db.commit()
    db.refresh(user)

    return user
