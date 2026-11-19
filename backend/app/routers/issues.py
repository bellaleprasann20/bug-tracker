
from datetime import datetime, timezone

from fastapi import APIRouter, HTTPException, Query, status
from sqlalchemy import select, func

from app.dependencies import DatabaseSession, CurrentUser
from app.core.permissions import UserRole
from app.models.user import User
from app.models.project import Project
from app.models.project_member import ProjectMember
from app.models.issue import Issue, IssueStatus
from app.models.activity import Activity
from app.schemas.issue import IssueCreate, IssueUpdate, IssueResponse


router = APIRouter(prefix="/issues", tags=["Issues"])


def check_project_access(db, project_id, user, allow_viewer=True):
    if user.role == UserRole.ADMIN:
        return

    membership = db.scalar(
        select(ProjectMember).where(
            ProjectMember.project_id == project_id,
            ProjectMember.user_id == user.id,
        )
    )

    if not membership:
        raise HTTPException(status_code=403, detail="Project access denied")

    if not allow_viewer and membership.role == "viewer":
        raise HTTPException(
            status_code=403,
            detail="You do not have permission to modify issues",
        )


@router.post(
    "/",
    response_model=IssueResponse,
    status_code=status.HTTP_201_CREATED,
)
def create_issue(
    data: IssueCreate,
    db: DatabaseSession,
    current_user: CurrentUser,
):
    project = db.get(Project, data.project_id)

    if not project:
        raise HTTPException(status_code=404, detail="Project not found")

    check_project_access(db, project.id, current_user, allow_viewer=False)

    if data.assignee_id:
        assignee = db.get(User, data.assignee_id)
        if not assignee or not assignee.is_active:
            raise HTTPException(status_code=404, detail="Assignee not found")

        membership = db.scalar(
            select(ProjectMember).where(
                ProjectMember.project_id == project.id,
                ProjectMember.user_id == assignee.id,
            )
        )
        if not membership:
            raise HTTPException(
                status_code=400,
                detail="Assignee must be a member of this project",
            )

    issue_count = db.scalar(
        select(func.count(Issue.id)).where(
            Issue.project_id == project.id
        )
    ) or 0

    issue = Issue(
        issue_key=f"{project.key}-{issue_count + 1}",
        title=data.title,
        description=data.description,
        issue_type=data.issue_type,
        priority=data.priority,
        project_id=project.id,
        reporter_id=current_user.id,
        assignee_id=data.assignee_id,
        story_points=data.story_points,
        labels=data.labels,
        due_date=data.due_date,
    )

    db.add(issue)
    db.flush()

    db.add(
        Activity(
            project_id=project.id,
            issue_id=issue.id,
            actor_id=current_user.id,
            action="issue_created",
            description=f"Created issue {issue.issue_key}",
        )
    )

    db.commit()
    db.refresh(issue)

    return issue


@router.get("/", response_model=list[IssueResponse])
def list_issues(
    db: DatabaseSession,
    current_user: CurrentUser,
    project_id: str | None = None,
    issue_status: IssueStatus | None = Query(default=None, alias="status"),
    priority: str | None = None,
    assignee_id: str | None = None,
    search: str | None = None,
    page: int = Query(default=1, ge=1),
    page_size: int = Query(default=20, ge=1, le=100),
):
    query = select(Issue)

    if current_user.role != UserRole.ADMIN:
        query = query.join(
            ProjectMember,
            ProjectMember.project_id == Issue.project_id,
        ).where(ProjectMember.user_id == current_user.id)

    if project_id:
        query = query.where(Issue.project_id == project_id)

    if issue_status:
        query = query.where(Issue.status == issue_status)

    if priority:
        query = query.where(Issue.priority == priority)

    if assignee_id:
        query = query.where(Issue.assignee_id == assignee_id)

    if search:
        query = query.where(
            Issue.title.ilike(f"%{search}%")
            | Issue.issue_key.ilike(f"%{search}%")
        )

    return db.scalars(
        query.order_by(Issue.created_at.desc())
        .offset((page - 1) * page_size)
        .limit(page_size)
    ).unique().all()


@router.get("/{issue_id}", response_model=IssueResponse)
def get_issue(
    issue_id: str,
    db: DatabaseSession,
    current_user: CurrentUser,
):
    issue = db.get(Issue, issue_id)

    if not issue:
        raise HTTPException(status_code=404, detail="Issue not found")

    check_project_access(db, issue.project_id, current_user)

    return issue


@router.patch("/{issue_id}", response_model=IssueResponse)
def update_issue(
    issue_id: str,
    data: IssueUpdate,
    db: DatabaseSession,
    current_user: CurrentUser,
):
    issue = db.get(Issue, issue_id)

    if not issue:
        raise HTTPException(status_code=404, detail="Issue not found")

    check_project_access(
        db,
        issue.project_id,
        current_user,
        allow_viewer=False,
    )

    updates = data.model_dump(exclude_unset=True)

    if "assignee_id" in updates and updates["assignee_id"]:
        membership = db.scalar(
            select(ProjectMember).where(
                ProjectMember.project_id == issue.project_id,
                ProjectMember.user_id == updates["assignee_id"],
            )
        )
        if not membership:
            raise HTTPException(
                status_code=400,
                detail="Assignee must belong to this project",
            )

    for field, value in updates.items():
        setattr(issue, field, value)

    if issue.status == IssueStatus.DONE and issue.resolved_at is None:
        issue.resolved_at = datetime.now(timezone.utc)
    elif issue.status != IssueStatus.DONE:
        issue.resolved_at = None

    db.add(
        Activity(
            project_id=issue.project_id,
            issue_id=issue.id,
            actor_id=current_user.id,
            action="issue_updated",
            description=f"Updated issue {issue.issue_key}",
        )
    )

    db.commit()
    db.refresh(issue)

    return issue


@router.delete("/{issue_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_issue(
    issue_id: str,
    db: DatabaseSession,
    current_user: CurrentUser,
):
    issue = db.get(Issue, issue_id)

    if not issue:
        raise HTTPException(status_code=404, detail="Issue not found")

    check_project_access(
        db,
        issue.project_id,
        current_user,
        allow_viewer=False,
    )

    project_id = issue.project_id
    issue_key = issue.issue_key

    db.add(
        Activity(
            project_id=project_id,
            actor_id=current_user.id,
            action="issue_deleted",
            description=f"Deleted issue {issue_key}",
        )
    )

    db.delete(issue)
    db.commit()

    return None
