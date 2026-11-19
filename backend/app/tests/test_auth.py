import pytest

from fastapi import HTTPException

from app.core.permissions import UserRole
from app.schemas.auth import LoginRequest
from app.schemas.user import UserCreate
from app.services.auth_service import (
    authenticate_user,
    create_user_token,
    login_user,
    register_user,
)


def test_user_registration(db_session):
    user_data = UserCreate(
        full_name="New Developer",
        email="newdeveloper@example.com",
        password="Password123",
    )

    user = register_user(db_session, user_data)

    assert user.id is not None
    assert user.email == "newdeveloper@example.com"
    assert user.role == UserRole.DEVELOPER
    assert user.hashed_password != "Password123"


def test_registration_always_uses_developer_role(db_session):
    user_data = UserCreate(
        full_name="New Admin",
        email="newadmin@example.com",
        password="Password123",
        role=UserRole.ADMIN,
    )

    user = register_user(db_session, user_data)

    assert user.role == UserRole.DEVELOPER


def test_duplicate_email_registration(db_session):
    user_data = UserCreate(
        full_name="Developer One",
        email="duplicate@example.com",
        password="Password123",
    )

    register_user(db_session, user_data)

    with pytest.raises(HTTPException) as error:
        register_user(db_session, user_data)

    assert error.value.status_code == 409


def test_successful_login(db_session, test_user):
    credentials = LoginRequest(
        email="developer@example.com",
        password="TestPassword123",
    )

    user = authenticate_user(db_session, credentials)

    assert user.id == test_user.id


def test_login_with_wrong_password(db_session, test_user):
    credentials = LoginRequest(
        email="developer@example.com",
        password="WrongPassword123",
    )

    with pytest.raises(HTTPException) as error:
        authenticate_user(db_session, credentials)

    assert error.value.status_code == 401


def test_login_with_unknown_email(db_session):
    credentials = LoginRequest(
        email="unknown@example.com",
        password="Password123",
    )

    with pytest.raises(HTTPException) as error:
        authenticate_user(db_session, credentials)

    assert error.value.status_code == 401


def test_inactive_user_cannot_login(db_session, test_user):
    test_user.is_active = False
    db_session.commit()

    credentials = LoginRequest(
        email="developer@example.com",
        password="TestPassword123",
    )

    with pytest.raises(HTTPException) as error:
        authenticate_user(db_session, credentials)

    assert error.value.status_code == 403


def test_token_generation(test_user):
    token_response = create_user_token(test_user)

    assert token_response.access_token
    assert token_response.token_type == "bearer"
    assert token_response.expires_in > 0


def test_login_returns_user_and_token(db_session, test_user):
    credentials = LoginRequest(
        email="developer@example.com",
        password="TestPassword123",
    )

    user, token = login_user(db_session, credentials)

    assert user.id == test_user.id
    assert token.access_token