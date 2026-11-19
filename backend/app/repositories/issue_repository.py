from uuid import UUID

from sqlalchemy import func, or_, select
from sqlalchemy.orm import Session

from app.models.issue import Issue, IssueStatus


def get_by_id(
    db: Session,
    issue_id: UUID,
) -> Issue | None:
    return db.get(Issue, issue_id)


def get_by_key(
    db: Session,
    issue_key: str,
) -> Issue | None:
    return db.scalar(
        select(Issue).where(Issue.issue_key == issue_key)
    )


def get_all(
    db: Session,
    skip: int = 0,
    limit: int = 10,
) -> list[Issue]:
    statement = (
        select(Issue)
        .order_by(Issue.created_at.desc())
        .offset(skip)
        .limit(limit)
    )
    return list(db.scalars(statement).all())


def get_by_project(
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

    if issue_status is not None:
        statement = statement.where(
            Issue.status == issue_status
        )

    if assignee_id is not None:
        statement = statement.where(
            Issue.assignee_id == assignee_id
        )

    if search:
        search_term = f"%{search.strip()}%"
        statement = statement.where(
            or_(
                Issue.title.ilike(search_term),
                Issue.issue_key.ilike(search_term),
                Issue.description.ilike(search_term),
            )
        )

    statement = (
        statement
        .order_by(Issue.created_at.desc())
        .offset(skip)
        .limit(limit)
    )

    return list(db.scalars(statement).all())


def count_by_project(
    db: Session,
    project_id: UUID,
    issue_status: IssueStatus | None = None,
    assignee_id: UUID | None = None,
    search: str | None = None,
) -> int:
    statement = select(func.count()).select_from(Issue).where(
        Issue.project_id == project_id
    )

    if issue_status is not None:
        statement = statement.where(
            Issue.status == issue_status
        )

    if assignee_id is not None:
        statement = statement.where(
            Issue.assignee_id == assignee_id
        )

    if search:
        search_term = f"%{search.strip()}%"
        statement = statement.where(
            or_(
                Issue.title.ilike(search_term),
                Issue.issue_key.ilike(search_term),
                Issue.description.ilike(search_term),
            )
        )

    return db.scalar(statement) or 0


def count_all(db: Session) -> int:
    return db.scalar(
        select(func.count()).select_from(Issue)
    ) or 0


def count_by_status(
    db: Session,
    project_id: UUID,
) -> dict[IssueStatus, int]:
    statement = (
        select(Issue.status, func.count(Issue.id))
        .where(Issue.project_id == project_id)
        .group_by(Issue.status)
    )

    return {
        issue_status: total
        for issue_status, total in db.execute(statement).all()
    }


def get_next_project_number(
    db: Session,
    project_id: UUID,
) -> int:
    total = db.scalar(
        select(func.count())
        .select_from(Issue)
        .where(Issue.project_id == project_id)
    ) or 0

    return total + 1


def create(db: Session, issue: Issue) -> Issue:
    db.add(issue)
    db.flush()
    return issue


def update(db: Session, issue: Issue) -> Issue:
    db.add(issue)
    db.flush()
    return issue


def delete(db: Session, issue: Issue) -> None:
    db.delete(issue)
    db.flush()