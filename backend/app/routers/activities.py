
from fastapi import APIRouter, HTTPException, Query
from sqlalchemy import select

from app.dependencies import DatabaseSession, CurrentUser
from app.core.permissions import UserRole
from app.models.project import Project
from app.models.project_member import ProjectMember
from app.models.activity import Activity
from app.schemas.activity import ActivityResponse


router = APIRouter(prefix="/activities", tags=["Activities"])


@router.get("/", response_model=list[ActivityResponse])
def list_activities(
    db: DatabaseSession,
    current_user: CurrentUser,
    project_id: str | None = None,
    limit: int = Query(default=20, ge=1, le=100),
):
    query = select(Activity)

    if project_id:
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

        query = query.where(Activity.project_id == project.id)

    elif current_user.role != UserRole.ADMIN:
        query = query.join(
            ProjectMember,
            ProjectMember.project_id == Activity.project_id,
        ).where(ProjectMember.user_id == current_user.id)

    return db.scalars(
        query.order_by(Activity.created_at.desc()).limit(limit)
    ).unique().all()
