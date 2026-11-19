import pytest

from fastapi import HTTPException

from app.schemas.project import ProjectCreate, ProjectUpdate
from app.services.project_service import (
    create_project,
    delete_project,
    get_project_by_id,
    get_project_by_key,
    get_user_projects,
    is_project_member,
    require_project_access,
    update_project,
)


def test_create_project(db_session, test_user):
    project_data = ProjectCreate(
        name="New Project",
        key="NEW",
        description="New project for testing.",
    )

    project = create_project(
        db_session,
        project_data,
        test_user.id,
    )

    assert project.id is not None
    assert project.name == "New Project"
    assert project.key == "NEW"
    assert project.owner_id == test_user.id


def test_duplicate_project_key(db_session, test_user):
    project_data = ProjectCreate(
        name="First Project",
        key="DUP",
    )

    create_project(
        db_session,
        project_data,
        test_user.id,
    )

    duplicate_data = ProjectCreate(
        name="Second Project",
        key="DUP",
    )

    with pytest.raises(HTTPException) as error:
        create_project(
            db_session,
            duplicate_data,
            test_user.id,
        )

    assert error.value.status_code == 409


def test_get_project_by_id(db_session, test_project):
    project = get_project_by_id(
        db_session,
        test_project.id,
    )

    assert project.id == test_project.id


def test_get_unknown_project(db_session):
    from uuid import uuid4

    with pytest.raises(HTTPException) as error:
        get_project_by_id(db_session, uuid4())

    assert error.value.status_code == 404


def test_get_project_by_key(db_session, test_project):
    project = get_project_by_key(
        db_session,
        "TEST",
    )

    assert project is not None
    assert project.id == test_project.id


def test_get_user_projects(db_session, test_user, test_project):
    projects = get_user_projects(
        db_session,
        test_user,
    )

    assert any(
        project.id == test_project.id
        for project in projects
    )


def test_project_owner_is_member(
    db_session,
    test_user,
    test_project,
):
    assert is_project_member(
        db_session,
        test_project.id,
        test_user.id,
    )


def test_project_owner_can_access(
    db_session,
    test_user,
    test_project,
):
    project = require_project_access(
        db_session,
        test_project.id,
        test_user,
    )

    assert project.id == test_project.id


def test_non_member_cannot_access_project(
    db_session,
    test_project,
):
    from app.models.user import User
    from app.core.security import hash_password

    outsider = User(
        full_name="Outsider",
        email="outsider@example.com",
        hashed_password=hash_password("Password123"),
    )

    db_session.add(outsider)
    db_session.commit()
    db_session.refresh(outsider)

    with pytest.raises(HTTPException) as error:
        require_project_access(
            db_session,
            test_project.id,
            outsider,
        )

    assert error.value.status_code == 403


def test_update_project(db_session, test_project):
    update_data = ProjectUpdate(
        name="Updated Project",
        description="Updated description.",
    )

    project = update_project(
        db_session,
        test_project.id,
        update_data,
    )

    assert project.name == "Updated Project"
    assert project.description == "Updated description."


def test_delete_project(db_session, test_project):
    project_id = test_project.id

    delete_project(db_session, project_id)

    assert get_project_by_id(db_session, project_id) is None