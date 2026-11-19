import logging
from uuid import UUID

from app.models.issue import Issue
from app.models.user import User


logger = logging.getLogger(__name__)


def notify_issue_assigned(
    issue: Issue,
    assignee: User,
) -> None:
    logger.info(
        "Issue assignment notification | "
        "issue=%s | assignee=%s | email=%s",
        issue.issue_key,
        assignee.full_name,
        assignee.email,
    )


def notify_issue_updated(
    issue: Issue,
    actor_id: UUID,
) -> None:
    logger.info(
        "Issue update notification | issue=%s | actor=%s",
        issue.issue_key,
        actor_id,
    )


def notify_new_comment(
    issue: Issue,
    author: User,
) -> None:
    logger.info(
        "New comment notification | "
        "issue=%s | author=%s",
        issue.issue_key,
        author.full_name,
    )


def notify_project_member_added(
    project_name: str,
    member: User,
) -> None:
    logger.info(
        "Project membership notification | "
        "project=%s | member=%s",
        project_name,
        member.email,
    )