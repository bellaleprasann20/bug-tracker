
from fastapi import APIRouter, HTTPException, status
from sqlalchemy import select, or_

from app.dependencies import DatabaseSession, CurrentUser
from app.core.permissions import UserRole
from app.models.project import Project
from app.models.project_member import ProjectMember
from app.models.activity import Activity
from app.schemas.project import (
    ProjectCreate,
    ProjectUpdate,
    ProjectResponse,
)


router = APIRouter(prefix="/projects", tags=["Projects"])


def can_manage_project(db, project_id, user):
    if user.role == UserRole.ADMIN:
        return True

    membership = db.scalar(
        select(ProjectMember).where(
            ProjectMember.project_id == project_id,
            ProjectMember.user_id == user.id,
            ProjectMember.role == "admin",
        )
    )

    return membership is not None


@router.post(
    "/",
    response_model=ProjectResponse,
    status_code=status.HTTP_201_CREATED,
)
def create_project(
    data: ProjectCreate,
    db: DatabaseSession,
    current_user: CurrentUser,
):
    existing = db.scalar(
        select(Project).where(
            or_(
                Project.key == data.key,
                Project.name == data.name,
            )
        )
    )

    if existing:
        raise HTTPException(
            status_code=409,
            detail="Project name or key already exists",
        )

    project = Project(
        name=data.name,
        key=data.key,
        description=data.description,
        owner_id=current_user.id,
    )

    db.add(project)
    db.flush()

    # Automatically add the project owner as its admin member.
    db.add(
        ProjectMember(
            project_id=project.id,
            user_id=current_user.id,
            role="admin",
        )
    )

    db.add(
        Activity(
            project_id=project.id,
            actor_id=current_user.id,
            action="project_created",
            description=f"Created project {project.name}",
        )
    )

    db.commit()
    db.refresh(project)

    return project


@router.get("/", response_model=list[ProjectResponse])
def list_projects(
    db: DatabaseSession,
    current_user: CurrentUser,
):
    if current_user.role == UserRole.ADMIN:
        return db.scalars(
            select(Project).order_by(Project.created_at.desc())
        ).all()

    return db.scalars(
        select(Project)
        .join(ProjectMember)
        .where(ProjectMember.user_id == current_user.id)
        .order_by(Project.created_at.desc())
    ).all()


@router.get("/{project_id}", response_model=ProjectResponse)
def get_project(
    project_id: str,
    db: DatabaseSession,
    current_user: CurrentUser,
):
    project = db.get(Project, project_id)

    if not project:
        raise HTTPException(status_code=404, detail="Project not found")

    if current_user.role != UserRole.ADMIN:
        membership = db.scalar(
            select(ProjectMember).where(
                ProjectMember.project_id == project.id,
                ProjectMember.user_id == current_user.id,
            )
        )
        if not membership:
            raise HTTPException(status_code=403, detail="Access denied")

    return project


@router.patch("/{project_id}", response_model=ProjectResponse)
def update_project(
    project_id: str,
    data: ProjectUpdate,
    db: DatabaseSession,
    current_user: CurrentUser,
):
    project = db.get(Project, project_id)

    if not project:
        raise HTTPException(status_code=404, detail="Project not found")

    if not can_manage_project(db, project.id, current_user):
        raise HTTPException(
            status_code=403,
            detail="You cannot manage this project",
        )

    updates = data.model_dump(exclude_unset=True)

    for field, value in updates.items():
        setattr(project, field, value)

    db.add(
        Activity(
            project_id=project.id,
            actor_id=current_user.id,
            action="project_updated",
            description=f"Updated project {project.name}",
        )
    )

    db.commit()
    db.refresh(project)

    return project


@router.delete("/{project_id}", status_code=status.HTTP_204_NO_CONTENT)
def archive_project(
    project_id: str,
    db: DatabaseSession,
    current_user: CurrentUser,
):
    project = db.get(Project, project_id)

    if not project:
        raise HTTPException(status_code=404, detail="Project not found")

    if not can_manage_project(db, project.id, current_user):
        raise HTTPException(status_code=403, detail="Access denied")

    project.status = "archived"
    db.commit()

    return None
