from datetime import datetime, timezone
from uuid import UUID

from fastapi import HTTPException, status
from sqlalchemy import select
from sqlalchemy.orm import Session

from app.models.activity import Activity
from app.models.issue import Issue, IssueStatus
from app.models.project import Project
from app.models.project_member import ProjectMember
from app.models.user import User
from app.schemas.issue import IssueCreate, IssueUpdate


def get_issue_by_id(
    db: Session,
    issue_id: UUID,
) -> Issue:
    issue = db.get(Issue, issue_id)

    if not issue:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Issue not found.",
        )

    return issue


def get_issue_by_key(
    db: Session,
    issue_key: str,
) -> Issue | None:
    return db.scalar(
        select(Issue).where(Issue.issue_key == issue_key)
    )


def get_project_issue_key(
    db: Session,
    project: Project,
) -> str:
    count = db.scalar(
        select(Issue.id).where(
            Issue.project_id == project.id
        )
    )

    total = len(
        db.scalars(
            select(Issue.id).where(
                Issue.project_id == project.id
            )
        ).all()
    )

    return f"{project.key}-{total + 1}"


def create_issue(
    db: Session,
    issue_data: IssueCreate,
    reporter_id: UUID,
) -> Issue:
    project = db.get(Project, issue_data.project_id)

    if not project:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Project not found.",
        )

    if issue_data.assignee_id:
        assignee = db.get(User, issue_data.assignee_id)

        if not assignee or not assignee.is_active:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="The selected assignee does not exist or is inactive.",
            )

        membership = db.scalar(
            select(ProjectMember).where(
                ProjectMember.project_id == project.id,
                ProjectMember.user_id == assignee.id,
            )
        )

        if assignee.id != project.owner_id and not membership:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="The assignee must be a member of this project.",
            )

    issue_key = get_project_issue_key(db, project)

    issue = Issue(
        issue_key=issue_key,
        title=issue_data.title,
        description=issue_data.description,
        issue_type=issue_data.issue_type,
        priority=issue_data.priority,
        project_id=issue_data.project_id,
        reporter_id=reporter_id,
        assignee_id=issue_data.assignee_id,
        story_points=issue_data.story_points,
        labels=issue_data.labels,
        due_date=issue_data.due_date,
    )

    db.add(issue)
    db.flush()

    activity = Activity(
        project_id=project.id,
        issue_id=issue.id,
        actor_id=reporter_id,
        action="issue_created",
        description=f"Created issue {issue.issue_key}",
        extra_data={"issue_key": issue.issue_key},
    )

    db.add(activity)
    db.commit()
    db.refresh(issue)

    return issue


def get_project_issues(
    db: Session,
    project_id: UUID,
    skip: int = 0,
    limit: int = 10,
    issue_status: IssueStatus | None = None,
    assignee_id: UUID | None = None,
    search: str | None = None,
) -> list[Issue]:
    statement = select(Issue).where(
        Issue.project_id == project_id
    )

    if issue_status:
        statement = statement.where(
            Issue.status == issue_status
        )

    if assignee_id:
        statement = statement.where(
            Issue.assignee_id == assignee_id
        )

    if search:
        statement = statement.where(
            Issue.title.ilike(f"%{search}%")
            | Issue.issue_key.ilike(f"%{search}%")
        )

    statement = (
        statement
        .order_by(Issue.created_at.desc())
        .offset(skip)
        .limit(limit)
    )

    return list(db.scalars(statement).all())


def update_issue(
    db: Session,
    issue_id: UUID,
    issue_data: IssueUpdate,
    actor_id: UUID,
) -> Issue:
    issue = get_issue_by_id(db, issue_id)

    updates = issue_data.model_dump(exclude_unset=True)

    if "assignee_id" in updates and updates["assignee_id"]:
        assignee = db.get(User, updates["assignee_id"])

        if not assignee or not assignee.is_active:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="The selected assignee does not exist or is inactive.",
            )

        membership = db.scalar(
            select(ProjectMember).where(
                ProjectMember.project_id == issue.project_id,
                ProjectMember.user_id == assignee.id,
            )
        )

        project = db.get(Project, issue.project_id)

        if assignee.id != project.owner_id and not membership:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="The assignee must be a member of this project.",
            )

    previous_status = issue.status

    for field, value in updates.items():
        setattr(issue, field, value)

    if (
        "status" in updates
        and issue.status == IssueStatus.DONE
        and previous_status != IssueStatus.DONE
    ):
        issue.resolved_at = datetime.now(timezone.utc)

    elif (
        "status" in updates
        and issue.status != IssueStatus.DONE
    ):
        issue.resolved_at = None

    activity = Activity(
        project_id=issue.project_id,
        issue_id=issue.id,
        actor_id=actor_id,
        action="issue_updated",
        description=f"Updated issue {issue.issue_key}",
        extra_data={"updated_fields": list(updates.keys())},
    )

    db.add(activity)
    db.commit()
    db.refresh(issue)

    return issue


def delete_issue(
    db: Session,
    issue_id: UUID,
    actor_id: UUID,
) -> None:
    issue = get_issue_by_id(db, issue_id)

    activity = Activity(
        project_id=issue.project_id,
        issue_id=None,
        actor_id=actor_id,
        action="issue_deleted",
        description=f"Deleted issue {issue.issue_key}",
        extra_data={"issue_key": issue.issue_key},
    )

    db.add(activity)
    db.delete(issue)
    db.commit()