
from fastapi import APIRouter
from sqlalchemy import select, func, case

from app.dependencies import DatabaseSession, CurrentUser
from app.core.permissions import UserRole
from app.models.issue import Issue, IssueStatus
from app.models.project import Project
from app.models.project_member import ProjectMember


router = APIRouter(prefix="/dashboard", tags=["Dashboard"])


@router.get("/summary")
def get_dashboard_summary(
    db: DatabaseSession,
    current_user: CurrentUser,
):
    project_query = select(func.count(Project.id))

    issue_query = select(func.count(Issue.id))

    if current_user.role != UserRole.ADMIN:
        project_query = (
            select(func.count(func.distinct(Project.id)))
            .join(ProjectMember)
            .where(ProjectMember.user_id == current_user.id)
        )

        issue_query = (
            select(func.count(Issue.id))
            .join(
                ProjectMember,
                ProjectMember.project_id == Issue.project_id,
            )
            .where(ProjectMember.user_id == current_user.id)
        )

    total_projects = db.scalar(project_query) or 0
    total_issues = db.scalar(issue_query) or 0

    status_query = (
        select(Issue.status, func.count(Issue.id))
        .group_by(Issue.status)
    )

    if current_user.role != UserRole.ADMIN:
        status_query = (
            select(Issue.status, func.count(Issue.id))
            .join(
                ProjectMember,
                ProjectMember.project_id == Issue.project_id,
            )
            .where(ProjectMember.user_id == current_user.id)
            .group_by(Issue.status)
        )

    status_counts = db.execute(status_query).all()

    issue_statuses = {
        status.value: 0 for status in IssueStatus
    }

    for issue_status, count in status_counts:
        issue_statuses[issue_status.value] = count

    assigned_query = select(func.count(Issue.id)).where(
        Issue.assignee_id == current_user.id
    )

    assigned_issues = db.scalar(assigned_query) or 0

    completed_query = select(func.count(Issue.id)).where(
        Issue.assignee_id == current_user.id,
        Issue.status == IssueStatus.DONE,
    )

    completed_issues = db.scalar(completed_query) or 0

    return {
        "total_projects": total_projects,
        "total_issues": total_issues,
        "assigned_issues": assigned_issues,
        "completed_issues": completed_issues,
        "issues_by_status": issue_statuses,
    }
