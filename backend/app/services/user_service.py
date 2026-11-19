from uuid import UUID

from fastapi import HTTPException, status
from sqlalchemy import select
from sqlalchemy.orm import Session

from app.core.security import hash_password
from app.models.user import User
from app.schemas.user import UserCreate, UserUpdate


def get_user_by_id(db: Session, user_id: UUID) -> User:
    user = db.get(User, user_id)

    if not user:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="User not found.",
        )

    return user


def get_user_by_email(db: Session, email: str) -> User | None:
    return db.scalar(
        select(User).where(User.email == email)
    )


def get_users(
    db: Session,
    skip: int = 0,
    limit: int = 10,
) -> list[User]:
    return list(
        db.scalars(
            select(User)
            .order_by(User.created_at.desc())
            .offset(skip)
            .limit(limit)
        ).all()
    )


def create_user(
    db: Session,
    user_data: UserCreate,
) -> User:
    existing_user = get_user_by_email(db, user_data.email)

    if existing_user:
        raise HTTPException(
            status_code=status.HTTP_409_CONFLICT,
            detail="An account with this email already exists.",
        )

    user = User(
        full_name=user_data.full_name,
        email=user_data.email,
        hashed_password=hash_password(user_data.password),
        role=user_data.role,
        is_active=True,
        is_verified=False,
    )

    db.add(user)
    db.commit()
    db.refresh(user)

    return user


def update_user(
    db: Session,
    user_id: UUID,
    user_data: UserUpdate,
) -> User:
    user = get_user_by_id(db, user_id)

    updates = user_data.model_dump(exclude_unset=True)

    if "email" in updates and updates["email"] is not None:
        existing_user = get_user_by_email(db, updates["email"])

        if existing_user and existing_user.id != user.id:
            raise HTTPException(
                status_code=status.HTTP_409_CONFLICT,
                detail="This email is already being used.",
            )

    if "password" in updates:
        password = updates.pop("password")

        if password:
            user.hashed_password = hash_password(password)

    for field, value in updates.items():
        setattr(user, field, value)

    db.commit()
    db.refresh(user)

    return user


def deactivate_user(db: Session, user_id: UUID) -> User:
    user = get_user_by_id(db, user_id)

    user.is_active = False

    db.commit()
    db.refresh(user)

    return user


def activate_user(db: Session, user_id: UUID) -> User:
    user = get_user_by_id(db, user_id)

    user.is_active = True

    db.commit()
    db.refresh(user)

    return user