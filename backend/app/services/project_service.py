from uuid import UUID

from fastapi import HTTPException, status
from sqlalchemy import select
from sqlalchemy.orm import Session

from app.models.project import Project
from app.models.project_member import ProjectMember
from app.models.user import User
from app.schemas.project import ProjectCreate, ProjectUpdate


def get_project_by_id(
    db: Session,
    project_id: UUID,
) -> Project:
    project = db.get(Project, project_id)

    if not project:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Project not found.",
        )

    return project


def get_project_by_key(
    db: Session,
    project_key: str,
) -> Project | None:
    return db.scalar(
        select(Project).where(Project.key == project_key)
    )


def get_user_projects(
    db: Session,
    user: User,
    skip: int = 0,
    limit: int = 10,
) -> list[Project]:
    if user.role.value == "admin":
        statement = select(Project)
    else:
        statement = (
            select(Project)
            .outerjoin(
                ProjectMember,
                ProjectMember.project_id == Project.id,
            )
            .where(
                (Project.owner_id == user.id)
                | (ProjectMember.user_id == user.id)
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


def create_project(
    db: Session,
    project_data: ProjectCreate,
    owner_id: UUID,
) -> Project:
    existing_project = get_project_by_key(
        db,
        project_data.key,
    )

    if existing_project:
        raise HTTPException(
            status_code=status.HTTP_409_CONFLICT,
            detail="A project with this key already exists.",
        )

    project = Project(
        name=project_data.name,
        key=project_data.key,
        description=project_data.description,
        owner_id=owner_id,
        status="active",
    )

    db.add(project)
    db.flush()

    # Automatically add the project owner as a project admin.
    owner_membership = ProjectMember(
        project_id=project.id,
        user_id=owner_id,
        role="admin",
    )

    db.add(owner_membership)
    db.commit()
    db.refresh(project)

    return project


def update_project(
    db: Session,
    project_id: UUID,
    project_data: ProjectUpdate,
) -> Project:
    project = get_project_by_id(db, project_id)

    updates = project_data.model_dump(exclude_unset=True)

    for field, value in updates.items():
        setattr(project, field, value)

    db.commit()
    db.refresh(project)

    return project


def delete_project(
    db: Session,
    project_id: UUID,
) -> None:
    project = get_project_by_id(db, project_id)

    db.delete(project)
    db.commit()


def is_project_member(
    db: Session,
    project_id: UUID,
    user_id: UUID,
) -> bool:
    membership = db.scalar(
        select(ProjectMember).where(
            ProjectMember.project_id == project_id,
            ProjectMember.user_id == user_id,
        )
    )

    project = db.get(Project, project_id)

    return bool(
        membership
        or (project and project.owner_id == user_id)
    )


def require_project_access(
    db: Session,
    project_id: UUID,
    user: User,
) -> Project:
    project = get_project_by_id(db, project_id)

    if user.role.value == "admin":
        return project

    if not is_project_member(db, project_id, user.id):
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="You do not have access to this project.",
        )

    return project