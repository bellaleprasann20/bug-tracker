from uuid import UUID

from sqlalchemy import func, select
from sqlalchemy.orm import Session

from app.models.user import User


def get_by_id(db: Session, user_id: UUID) -> User | None:
    return db.get(User, user_id)


def get_by_email(db: Session, email: str) -> User | None:
    return db.scalar(
        select(User).where(User.email == email)
    )


def get_all(
    db: Session,
    skip: int = 0,
    limit: int = 10,
) -> list[User]:
    statement = (
        select(User)
        .order_by(User.created_at.desc())
        .offset(skip)
        .limit(limit)
    )
    return list(db.scalars(statement).all())


def count_all(db: Session) -> int:
    return db.scalar(
        select(func.count()).select_from(User)
    ) or 0


def create(db: Session, user: User) -> User:
    db.add(user)
    db.flush()
    return user


def update(db: Session, user: User) -> User:
    db.add(user)
    db.flush()
    return user


def delete(db: Session, user: User) -> None:
    db.delete(user)
    db.flush()


def email_exists(
    db: Session,
    email: str,
    exclude_user_id: UUID | None = None,
) -> bool:
    statement = select(User.id).where(User.email == email)

    if exclude_user_id:
        statement = statement.where(User.id != exclude_user_id)

    return db.scalar(statement) is not None