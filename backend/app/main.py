
from contextlib import asynccontextmanager

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from app.config import settings
from app.core.exceptions import register_exception_handlers
from app.core.logging import setup_logging
from app.routers import (
    auth_router,
    users_router,
    projects_router,
    members_router,
    issues_router,
    comments_router,
    attachments_router,
    dashboard_router,
    activities_router,
)


setup_logging()


@asynccontextmanager
async def lifespan(app: FastAPI):
    print(f"{settings.APP_NAME} starting...")
    yield
    print(f"{settings.APP_NAME} shutting down...")


app = FastAPI(
    title=settings.APP_NAME,
    version=settings.APP_VERSION,
    description="A Jira-like Bug and Issue Tracking System API",
    debug=settings.DEBUG,
    lifespan=lifespan,
)


app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.CORS_ORIGINS,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


register_exception_handlers(app)


api = settings.API_V1_PREFIX

app.include_router(auth_router, prefix=api)
app.include_router(users_router, prefix=api)
app.include_router(projects_router, prefix=api)
app.include_router(members_router, prefix=api)
app.include_router(issues_router, prefix=api)
app.include_router(comments_router, prefix=api)
app.include_router(attachments_router, prefix=api)
app.include_router(dashboard_router, prefix=api)
app.include_router(activities_router, prefix=api)


@app.get("/", tags=["Root"])
def root():
    return {
        "success": True,
        "message": "Welcome to Bug Tracker API",
        "version": settings.APP_VERSION,
    }


@app.get(f"{settings.API_V1_PREFIX}/health", tags=["Health"])
def health_check():
    return {
        "success": True,
        "status": "healthy",
        "application": settings.APP_NAME,
    }
