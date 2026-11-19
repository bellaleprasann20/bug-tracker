from uuid import UUID

from sqlalchemy import func, or_, select
from sqlalchemy.orm import Session

from app.models.project import Project
from app.models.project_member import ProjectMember


def get_by_id(
    db: Session,
    project_id: UUID,
) -> Project | None:
    return db.get(Project, project_id)


def get_by_key(
    db: Session,
    project_key: str,
) -> Project | None:
    return db.scalar(
        select(Project).where(Project.key == project_key)
    )


def get_all(
    db: Session,
    skip: int = 0,
    limit: int = 10,
) -> list[Project]:
    statement = (
        select(Project)
        .order_by(Project.created_at.desc())
        .offset(skip)
        .limit(limit)
    )
    return list(db.scalars(statement).all())


def get_for_user(
    db: Session,
    user_id: UUID,
    is_admin: bool = False,
    skip: int = 0,
    limit: int = 10,
) -> list[Project]:
    if is_admin:
        statement = select(Project)
    else:
        statement = (
            select(Project)
            .outerjoin(
                ProjectMember,
                ProjectMember.project_id == Project.id,
            )
            .where(
                or_(
                    Project.owner_id == user_id,
                    ProjectMember.user_id == user_id,
                )
            )
            .distinct()
        )

    statement = (
        statement
        .order_by(Project.created_at.desc())
        .offset(skip)
        .limit(limit)
    )

    return list(db.scalars(statement).all())


def count_all(db: Session) -> int:
    return db.scalar(
        select(func.count()).select_from(Project)
    ) or 0


def create(db: Session, project: Project) -> Project:
    db.add(project)
    db.flush()
    return project


def update(db: Session, project: Project) -> Project:
    db.add(project)
    db.flush()
    return project


def delete(db: Session, project: Project) -> None:
    db.delete(project)
    db.flush()


def is_member(
    db: Session,
    project_id: UUID,
    user_id: UUID,
) -> bool:
    membership_id = db.scalar(
        select(ProjectMember.id).where(
            ProjectMember.project_id == project_id,
            ProjectMember.user_id == user_id,
        )
    )

    return membership_id is not None


def get_membership(
    db: Session,
    project_id: UUID,
    user_id: UUID,
) -> ProjectMember | None:
    return db.scalar(
        select(ProjectMember).where(
            ProjectMember.project_id == project_id,
            ProjectMember.user_id == user_id,
        )
    )


def add_member(
    db: Session,
    membership: ProjectMember,
) -> ProjectMember:
    db.add(membership)
    db.flush()
    return membership


def remove_member(
    db: Session,
    membership: ProjectMember,
) -> None:
    db.delete(membership)
    db.flush()


def get_members(
    db: Session,
    project_id: UUID,
) -> list[ProjectMember]:
    statement = (
        select(ProjectMember)
        .where(ProjectMember.project_id == project_id)
        .order_by(ProjectMember.joined_at.asc())
    )
    return list(db.scalars(statement).all())


def count_members(db: Session, project_id: UUID) -> int:
    return db.scalar(
        select(func.count())
        .select_from(ProjectMember)
        .where(ProjectMember.project_id == project_id)
    ) or 0