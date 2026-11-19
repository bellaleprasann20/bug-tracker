
from app.routers.auth import router as auth_router
from app.routers.users import router as users_router
from app.routers.projects import router as projects_router
from app.routers.members import router as members_router
from app.routers.issues import router as issues_router
from app.routers.comments import router as comments_router
from app.routers.attachments import router as attachments_router
from app.routers.dashboard import router as dashboard_router
from app.routers.activities import router as activities_router

__all__ = [
    "auth_router",
    "users_router",
    "projects_router",
    "members_router",
    "issues_router",
    "comments_router",
    "attachments_router",
    "dashboard_router",
    "activities_router",
]
