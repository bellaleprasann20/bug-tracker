import pytest

from fastapi import HTTPException

from app.schemas.user import UserCreate, UserUpdate
from app.services.user_service import (
    activate_user,
    create_user,
    deactivate_user,
    get_user_by_id,
    get_user_by_email,
    get_users,
    update_user,
)


def test_get_user_by_id(db_session, test_user):
    user = get_user_by_id(db_session, test_user.id)

    assert user.id == test_user.id
    assert user.email == test_user.email


def test_get_unknown_user(db_session):
    from uuid import uuid4

    with pytest.raises(HTTPException) as error:
        get_user_by_id(db_session, uuid4())

    assert error.value.status_code == 404


def test_get_user_by_email(db_session, test_user):
    user = get_user_by_email(
        db_session,
        "developer@example.com",
    )

    assert user is not None
    assert user.id == test_user.id


def test_create_user(db_session):
    user_data = UserCreate(
        full_name="Another Developer",
        email="another@example.com",
        password="Password123",
    )

    user = create_user(db_session, user_data)

    assert user.id is not None
    assert user.email == "another@example.com"


def test_duplicate_user_email(db_session, test_user):
    user_data = UserCreate(
        full_name="Duplicate Developer",
        email="developer@example.com",
        password="Password123",
    )

    with pytest.raises(HTTPException) as error:
        create_user(db_session, user_data)

    assert error.value.status_code == 409


def test_get_users(db_session, test_user, test_admin):
    users = get_users(db_session)

    assert len(users) == 2


def test_update_user_name(db_session, test_user):
    update_data = UserUpdate(
        full_name="Updated Developer",
    )

    updated_user = update_user(
        db_session,
        test_user.id,
        update_data,
    )

    assert updated_user.full_name == "Updated Developer"


def test_update_user_email(db_session, test_user):
    update_data = UserUpdate(
        email="updated@example.com",
    )

    updated_user = update_user(
        db_session,
        test_user.id,
        update_data,
    )

    assert updated_user.email == "updated@example.com"


def test_update_user_password(db_session, test_user):
    from app.core.security import verify_password

    update_data = UserUpdate(
        password="NewPassword123",
    )

    updated_user = update_user(
        db_session,
        test_user.id,
        update_data,
    )

    assert verify_password(
        "NewPassword123",
        updated_user.hashed_password,
    )


def test_cannot_use_another_users_email(
    db_session,
    test_user,
    test_admin,
):
    update_data = UserUpdate(
        email=test_admin.email,
    )

    with pytest.raises(HTTPException) as error:
        update_user(
            db_session,
            test_user.id,
            update_data,
        )

    assert error.value.status_code == 409


def test_deactivate_user(db_session, test_user):
    user = deactivate_user(
        db_session,
        test_user.id,
    )

    assert user.is_active is False


def test_activate_user(db_session, test_user):
    deactivate_user(db_session, test_user.id)

    user = activate_user(
        db_session,
        test_user.id,
    )

    assert user.is_active is True