
from enum import Enum

from fastapi import HTTPException, status


class UserRole(str, Enum):
    ADMIN = "admin"
    DEVELOPER = "developer"
    VIEWER = "viewer"


# Permission definitions
ROLE_PERMISSIONS = {
    UserRole.ADMIN: {
        "create_project",
        "update_project",
        "delete_project",
        "manage_members",
        "create_issue",
        "update_issue",
        "delete_issue",
        "assign_issue",
        "comment_issue",
        "view_issue",
        "upload_attachment",
        "manage_users",
        "view_dashboard",
    },

    UserRole.DEVELOPER: {
        "view_issue",
        "create_issue",
        "update_issue",
        "comment_issue",
        "upload_attachment",
        "view_dashboard",
    },

    UserRole.VIEWER: {
        "view_issue",
        "view_dashboard",
    },
}


def has_permission(
    role: str | UserRole,
    permission: str,
) -> bool:
    """Check whether a role has a specific permission."""

    try:
        normalized_role = UserRole(role)
    except ValueError:
        return False

    return permission in ROLE_PERMISSIONS.get(
        normalized_role,
        set(),
    )


def require_permission(
    role: str | UserRole,
    permission: str,
) -> None:
    """Raise HTTP 403 when permission is missing."""

    if not has_permission(role, permission):
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="You do not have permission to perform this action.",
        )


def require_role(
    user_role: str | UserRole,
    allowed_roles: list[UserRole],
) -> None:
    """Restrict an operation to specific roles."""

    try:
        normalized_role = UserRole(user_role)
    except ValueError:
        normalized_role = None

    if normalized_role not in allowed_roles:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Your role is not authorized for this action.",
        )
