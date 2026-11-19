import pytest

from fastapi.testclient import TestClient
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker
from sqlalchemy.pool import StaticPool

from app.database import Base, get_db
from app.main import app

# Import models so SQLAlchemy registers all tables.
from app import models  # noqa: F401


TEST_DATABASE_URL = "sqlite://"


test_engine = create_engine(
    TEST_DATABASE_URL,
    connect_args={"check_same_thread": False},
    poolclass=StaticPool,
)

TestingSessionLocal = sessionmaker(
    bind=test_engine,
    autoflush=False,
    autocommit=False,
    expire_on_commit=False,
)


@pytest.fixture()
def db_session():
    Base.metadata.drop_all(bind=test_engine)
    Base.metadata.create_all(bind=test_engine)

    db = TestingSessionLocal()

    try:
        yield db
    finally:
        db.close()
        Base.metadata.drop_all(bind=test_engine)


@pytest.fixture()
def client(db_session):
    def override_get_db():
        try:
            yield db_session
        finally:
            pass

    app.dependency_overrides[get_db] = override_get_db

    with TestClient(app) as test_client:
        yield test_client

    app.dependency_overrides.clear()


@pytest.fixture()
def test_user(db_session):
    from app.schemas.user import UserCreate
    from app.services.auth_service import register_user

    user_data = UserCreate(
        full_name="Test Developer",
        email="developer@example.com",
        password="TestPassword123",
    )

    return register_user(db_session, user_data)


@pytest.fixture()
def test_admin(db_session):
    from app.core.permissions import UserRole
    from app.core.security import hash_password
    from app.models.user import User

    admin = User(
        full_name="Test Administrator",
        email="admin@example.com",
        hashed_password=hash_password("AdminPassword123"),
        role=UserRole.ADMIN,
        is_active=True,
        is_verified=True,
    )

    db_session.add(admin)
    db_session.commit()
    db_session.refresh(admin)

    return admin


@pytest.fixture()
def test_project(db_session, test_user):
    from app.schemas.project import ProjectCreate
    from app.services.project_service import create_project

    project_data = ProjectCreate(
        name="Test Project",
        key="TEST",
        description="Project used for automated tests.",
    )

    return create_project(
        db_session,
        project_data,
        test_user.id,
    )


@pytest.fixture()
def test_issue(db_session, test_user, test_project):
    from app.schemas.issue import IssueCreate
    from app.services.issue_service import create_issue

    issue_data = IssueCreate(
        title="Test issue",
        description="Issue created for automated testing.",
        project_id=test_project.id,
    )

    return create_issue(
        db_session,
        issue_data,
        test_user.id,
    )