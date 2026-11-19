import pytest

from fastapi import HTTPException

from app.core.permissions import (
    UserRole,
    has_permission,
    require_permission,
    require_role,
)


def test_admin_can_create_project():
    assert has_permission(
        UserRole.ADMIN,
        "create_project",
    )


def test_developer_can_create_issue():
    assert has_permission(
        UserRole.DEVELOPER,
        "create_issue",
    )


def test_viewer_can_view_issues():
    assert has_permission(
        UserRole.VIEWER,
        "view_issue",
    )


def test_viewer_cannot_create_issue():
    assert not has_permission(
        UserRole.VIEWER,
        "create_issue",
    )


def test_developer_cannot_delete_project():
    assert not has_permission(
        UserRole.DEVELOPER,
        "delete_project",
    )


def test_unknown_permission_is_denied():
    assert not has_permission(
        UserRole.ADMIN,
        "unknown_permission",
    )


def test_require_permission_allows_admin():
    require_permission(
        UserRole.ADMIN,
        "delete_project",
    )


def test_require_permission_rejects_viewer():
    with pytest.raises(HTTPException) as error:
        require_permission(
            UserRole.VIEWER,
            "create_issue",
        )

    assert error.value.status_code == 403


def test_require_role_allows_admin():
    require_role(
        UserRole.ADMIN,
        [UserRole.ADMIN, UserRole.DEVELOPER],
    )


def test_require_role_rejects_viewer():
    with pytest.raises(HTTPException) as error:
        require_role(
            UserRole.VIEWER,
            [UserRole.ADMIN],
        )

    assert error.value.status_code == 403


def test_role_string_is_supported():
    assert has_permission(
        "developer",
        "create_issue",
    )


def test_invalid_role_is_rejected():
    assert not has_permission(
        "unknown",
        "create_issue",
    )