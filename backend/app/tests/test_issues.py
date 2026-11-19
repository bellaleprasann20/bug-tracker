import pytest

from fastapi import HTTPException

from app.models.issue import IssueStatus
from app.schemas.issue import IssueCreate, IssueUpdate
from app.services.issue_service import (
    create_issue,
    delete_issue,
    get_issue_by_id,
    get_issue_by_key,
    get_project_issues,
    update_issue,
)


def test_create_issue(db_session, test_user, test_project):
    issue_data = IssueCreate(
        title="Login button not working",
        description="Login button does not respond.",
        project_id=test_project.id,
    )

    issue = create_issue(
        db_session,
        issue_data,
        test_user.id,
    )

    assert issue.id is not None
    assert issue.title == "Login button not working"
    assert issue.project_id == test_project.id
    assert issue.reporter_id == test_user.id
    assert issue.issue_key.startswith("TEST-")


def test_create_issue_with_unknown_project(db_session, test_user):
    from uuid import uuid4

    issue_data = IssueCreate(
        title="Invalid project issue",
        project_id=uuid4(),
    )

    with pytest.raises(HTTPException) as error:
        create_issue(
            db_session,
            issue_data,
            test_user.id,
        )

    assert error.value.status_code == 404


def test_get_issue_by_id(db_session, test_issue):
    issue = get_issue_by_id(
        db_session,
        test_issue.id,
    )

    assert issue.id == test_issue.id


def test_get_unknown_issue(db_session):
    from uuid import uuid4

    with pytest.raises(HTTPException) as error:
        get_issue_by_id(db_session, uuid4())

    assert error.value.status_code == 404


def test_get_issue_by_key(db_session, test_issue):
    issue = get_issue_by_key(
        db_session,
        test_issue.issue_key,
    )

    assert issue is not None
    assert issue.id == test_issue.id


def test_get_project_issues(
    db_session,
    test_project,
    test_issue,
):
    issues = get_project_issues(
        db_session,
        test_project.id,
    )

    assert len(issues) == 1
    assert issues[0].id == test_issue.id


def test_filter_issues_by_status(
    db_session,
    test_project,
    test_issue,
):
    issues = get_project_issues(
        db_session,
        test_project.id,
        issue_status=IssueStatus.TODO,
    )

    assert all(
        issue.status == IssueStatus.TODO
        for issue in issues
    )


def test_search_issues(
    db_session,
    test_project,
    test_issue,
):
    issues = get_project_issues(
        db_session,
        test_project.id,
        search="Test issue",
    )

    assert len(issues) == 1
    assert issues[0].id == test_issue.id


def test_update_issue_title(
    db_session,
    test_issue,
    test_user,
):
    update_data = IssueUpdate(
        title="Updated issue title",
    )

    issue = update_issue(
        db_session,
        test_issue.id,
        update_data,
        test_user.id,
    )

    assert issue.title == "Updated issue title"


def test_update_issue_status(
    db_session,
    test_issue,
    test_user,
):
    update_data = IssueUpdate(
        status=IssueStatus.DONE,
    )

    issue = update_issue(
        db_session,
        test_issue.id,
        update_data,
        test_user.id,
    )

    assert issue.status == IssueStatus.DONE
    assert issue.resolved_at is not None


def test_delete_issue(
    db_session,
    test_issue,
    test_user,
):
    issue_id = test_issue.id

    delete_issue(
        db_session,
        issue_id,
        test_user.id,
    )

    assert get_issue_by_id(db_session, issue_id) is None