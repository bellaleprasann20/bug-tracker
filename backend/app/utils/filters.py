from uuid import UUID

from sqlalchemy import Select, or_

from app.models.issue import (
    Issue,
    IssuePriority,
    IssueStatus,
    IssueType,
)


def filter_by_project(
    statement: Select,
    project_id: UUID,
) -> Select:
    return statement.where(
        Issue.project_id == project_id
    )


def filter_by_status(
    statement: Select,
    issue_status: IssueStatus | None,
) -> Select:
    if issue_status is not None:
        statement = statement.where(
            Issue.status == issue_status
        )

    return statement


def filter_by_priority(
    statement: Select,
    priority: IssuePriority | None,
) -> Select:
    if priority is not None:
        statement = statement.where(
            Issue.priority == priority
        )

    return statement


def filter_by_type(
    statement: Select,
    issue_type: IssueType | None,
) -> Select:
    if issue_type is not None:
        statement = statement.where(
            Issue.issue_type == issue_type
        )

    return statement


def filter_by_assignee(
    statement: Select,
    assignee_id: UUID | None,
) -> Select:
    if assignee_id is not None:
        statement = statement.where(
            Issue.assignee_id == assignee_id
        )

    return statement


def filter_by_reporter(
    statement: Select,
    reporter_id: UUID | None,
) -> Select:
    if reporter_id is not None:
        statement = statement.where(
            Issue.reporter_id == reporter_id
        )

    return statement


def search_issues(
    statement: Select,
    search: str | None,
) -> Select:
    if search and search.strip():
        search_term = f"%{search.strip()}%"

        statement = statement.where(
            or_(
                Issue.title.ilike(search_term),
                Issue.issue_key.ilike(search_term),
                Issue.description.ilike(search_term),
            )
        )

    return statement


def apply_issue_filters(
    statement: Select,
    project_id: UUID | None = None,
    issue_status: IssueStatus | None = None,
    priority: IssuePriority | None = None,
    issue_type: IssueType | None = None,
    assignee_id: UUID | None = None,
    reporter_id: UUID | None = None,
    search: str | None = None,
) -> Select:
    if project_id is not None:
        statement = filter_by_project(
            statement,
            project_id,
        )

    statement = filter_by_status(
        statement,
        issue_status,
    )

    statement = filter_by_priority(
        statement,
        priority,
    )

    statement = filter_by_type(
        statement,
        issue_type,
    )

    statement = filter_by_assignee(
        statement,
        assignee_id,
    )

    statement = filter_by_reporter(
        statement,
        reporter_id,
    )

    statement = search_issues(
        statement,
        search,
    )

    return statement