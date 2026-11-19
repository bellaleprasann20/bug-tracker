import pytest

from fastapi import HTTPException

from app.schemas.comment import CommentCreate, CommentUpdate
from app.services.comment_service import (
    create_comment,
    delete_comment,
    get_comment_by_id,
    get_issue_comments,
    update_comment,
)


def test_create_comment(db_session, test_issue, test_user):
    comment_data = CommentCreate(
        issue_id=test_issue.id,
        content="This issue has been reported.",
    )

    comment = create_comment(
        db_session,
        comment_data,
        test_user.id,
    )

    assert comment.id is not None
    assert comment.issue_id == test_issue.id
    assert comment.author_id == test_user.id
    assert comment.content == "This issue has been reported."


def test_create_reply(db_session, test_issue, test_user):
    parent = create_comment(
        db_session,
        CommentCreate(
            issue_id=test_issue.id,
            content="Parent comment",
        ),
        test_user.id,
    )

    reply = create_comment(
        db_session,
        CommentCreate(
            issue_id=test_issue.id,
            parent_id=parent.id,
            content="Reply to parent",
        ),
        test_user.id,
    )

    assert reply.parent_id == parent.id


def test_reply_to_comment_from_another_issue(
    db_session,
    test_user,
    test_project,
):
    from app.schemas.issue import IssueCreate
    from app.services.issue_service import create_issue

    first_issue = create_issue(
        db_session,
        IssueCreate(
            title="First issue",
            project_id=test_project.id,
        ),
        test_user.id,
    )

    second_issue = create_issue(
        db_session,
        IssueCreate(
            title="Second issue",
            project_id=test_project.id,
        ),
        test_user.id,
    )

    parent = create_comment(
        db_session,
        CommentCreate(
            issue_id=first_issue.id,
            content="First issue comment",
        ),
        test_user.id,
    )

    with pytest.raises(HTTPException) as error:
        create_comment(
            db_session,
            CommentCreate(
                issue_id=second_issue.id,
                parent_id=parent.id,
                content="Invalid reply",
            ),
            test_user.id,
        )

    assert error.value.status_code == 400


def test_get_issue_comments(db_session, test_issue, test_user):
    create_comment(
        db_session,
        CommentCreate(
            issue_id=test_issue.id,
            content="First comment",
        ),
        test_user.id,
    )

    comments = get_issue_comments(
        db_session,
        test_issue.id,
    )

    assert len(comments) == 1


def test_update_own_comment(db_session, test_issue, test_user):
    comment = create_comment(
        db_session,
        CommentCreate(
            issue_id=test_issue.id,
            content="Original comment",
        ),
        test_user.id,
    )

    updated = update_comment(
        db_session,
        comment.id,
        CommentUpdate(content="Updated comment"),
        test_user.id,
    )

    assert updated.content == "Updated comment"


def test_other_user_cannot_update_comment(
    db_session,
    test_issue,
    test_user,
    test_admin,
):
    comment = create_comment(
        db_session,
        CommentCreate(
            issue_id=test_issue.id,
            content="Original comment",
        ),
        test_user.id,
    )

    with pytest.raises(HTTPException) as error:
        update_comment(
            db_session,
            comment.id,
            CommentUpdate(content="Unauthorized update"),
            test_admin.id,
        )

    assert error.value.status_code == 403


def test_admin_can_update_another_users_comment(
    db_session,
    test_issue,
    test_user,
    test_admin,
):
    comment = create_comment(
        db_session,
        CommentCreate(
            issue_id=test_issue.id,
            content="Original comment",
        ),
        test_user.id,
    )

    updated = update_comment(
        db_session,
        comment.id,
        CommentUpdate(content="Admin updated comment"),
        test_admin.id,
        is_admin=True,
    )

    assert updated.content == "Admin updated comment"


def test_delete_own_comment(db_session, test_issue, test_user):
    comment = create_comment(
        db_session,
        CommentCreate(
            issue_id=test_issue.id,
            content="Comment to delete",
        ),
        test_user.id,
    )

    comment_id = comment.id

    delete_comment(
        db_session,
        comment_id,
        test_user.id,
    )

    assert get_comment_by_id(db_session, comment_id) is None


def test_other_user_cannot_delete_comment(
    db_session,
    test_issue,
    test_user,
    test_admin,
):
    comment = create_comment(
        db_session,
        CommentCreate(
            issue_id=test_issue.id,
            content="Protected comment",
        ),
        test_user.id,
    )

    with pytest.raises(HTTPException) as error:
        delete_comment(
            db_session,
            comment.id,
            test_admin.id,
        )

    assert error.value.status_code == 403