
from fastapi import APIRouter, HTTPException, status
from sqlalchemy import select

from app.dependencies import DatabaseSession, CurrentUser
from app.core.permissions import UserRole
from app.models.user import User
from app.models.project import Project
from app.models.project_member import ProjectMember
from app.models.activity import Activity
from app.schemas.project import (
    ProjectMemberCreate,
    ProjectMemberResponse,
)


router = APIRouter(
    prefix="/projects/{project_id}/members",
    tags=["Project Members"],
)


def check_project_admin(db, project_id, user):
    if user.role == UserRole.ADMIN:
        return

    membership = db.scalar(
        select(ProjectMember).where(
            ProjectMember.project_id == project_id,
            ProjectMember.user_id == user.id,
            ProjectMember.role == "admin",
        )
    )

    if not membership:
        raise HTTPException(
            status_code=403,
            detail="Project admin access required",
        )


@router.get("/", response_model=list[ProjectMemberResponse])
def list_members(
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

    return db.scalars(
        select(ProjectMember).where(
            ProjectMember.project_id == project.id
        )
    ).all()


@router.post(
    "/",
    response_model=ProjectMemberResponse,
    status_code=status.HTTP_201_CREATED,
)
def add_member(
    project_id: str,
    data: ProjectMemberCreate,
    db: DatabaseSession,
    current_user: CurrentUser,
):
    project = db.get(Project, project_id)

    if not project:
        raise HTTPException(status_code=404, detail="Project not found")

    check_project_admin(db, project.id, current_user)

    user = db.get(User, data.user_id)

    if not user or not user.is_active:
        raise HTTPException(status_code=404, detail="Active user not found")

    existing = db.scalar(
        select(ProjectMember).where(
            ProjectMember.project_id == project.id,
            ProjectMember.user_id == user.id,
        )
    )

    if existing:
        raise HTTPException(
            status_code=409,
            detail="User is already a project member",
        )

    member = ProjectMember(
        project_id=project.id,
        user_id=user.id,
        role=data.role,
    )

    db.add(member)
    db.add(
        Activity(
            project_id=project.id,
            actor_id=current_user.id,
            action="member_added",
            description=f"Added {user.full_name} to the project",
        )
    )

    db.commit()
    db.refresh(member)

    return member


@router.delete(
    "/{user_id}",
    status_code=status.HTTP_204_NO_CONTENT,
)
def remove_member(
    project_id: str,
    user_id: str,
    db: DatabaseSession,
    current_user: CurrentUser,
):
    project = db.get(Project, project_id)

    if not project:
        raise HTTPException(status_code=404, detail="Project not found")

    check_project_admin(db, project.id, current_user)

    member = db.scalar(
        select(ProjectMember).where(
            ProjectMember.project_id == project.id,
            ProjectMember.user_id == user_id,
        )
    )

    if not member:
        raise HTTPException(status_code=404, detail="Member not found")

    if member.user_id == project.owner_id:
        raise HTTPException(
            status_code=400,
            detail="The project owner cannot be removed",
        )

    db.delete(member)

    db.add(
        Activity(
            project_id=project.id,
            actor_id=current_user.id,
            action="member_removed",
            description=f"Removed member {user_id}",
        )
    )

    db.commit()

    return None
