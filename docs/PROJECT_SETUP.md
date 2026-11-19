
# Bug Tracker - Project Setup Guide

## 1. Project Overview

Bug Tracker is a full-stack issue management application inspired by Jira and Linear.

It allows teams to:

- Create and manage projects.
- Track bugs, tasks, and feature requests.
- Assign issues to developers.
- Organize work using a Kanban board.
- Add comments and threaded replies.
- Upload issue attachments.
- Monitor project progress and activity.

## 2. Technology Stack

### Frontend
- React
- Vite
- Tailwind CSS v4
- React Router
- Axios
- dnd-kit
- Recharts
- Framer Motion
- React Icons

### Backend
- Python
- FastAPI
- SQLAlchemy
- Pydantic
- PostgreSQL
- Alembic
- JWT Authentication

## 3. Prerequisites

Install:

- Node.js and npm
- Python 3.11 or newer
- PostgreSQL
- Git

## 4. Clone the Project

```bash
git clone <YOUR_GITHUB_REPOSITORY_URL>
cd bug-tracker
```

Replace the repository URL with your actual GitHub repository.

## 5. Backend Setup

Open a terminal in the backend directory.

### Create virtual environment

Windows PowerShell:

```powershell
python -m venv .venv
.\.venv\Scripts\Activate.ps1
```

If PowerShell blocks activation, use:

```powershell
Set-ExecutionPolicy -Scope Process -ExecutionPolicy Bypass
.\.venv\Scripts\Activate.ps1
```

### Install dependencies

```powershell
pip install -r requirements.txt
```

### Configure environment

Copy the example environment file:

```powershell
Copy-Item .env.example .env
```

Update `.env`:

```dotenv
APP_NAME=Bug Tracker API
APP_VERSION=1.0.0
DEBUG=True
API_V1_PREFIX=/api/v1

DATABASE_URL=postgresql+psycopg://postgres:YOUR_POSTGRES_PASSWORD@localhost:5432/bug_tracker

JWT_SECRET_KEY=YOUR_LONG_RANDOM_SECRET
JWT_ALGORITHM=HS256
ACCESS_TOKEN_EXPIRE_MINUTES=30

CORS_ORIGINS=["http://localhost:5173","http://127.0.0.1:5173"]
```

Replace the database password and JWT secret with your own values.

### Create PostgreSQL database

Create a database named:

`bug_tracker`

You can create it using pgAdmin or PostgreSQL's command-line tools.

### Run database migrations

```powershell
alembic upgrade head
```

### Start the backend

```powershell
uvicorn app.main:app --reload --host 127.0.0.1 --port 8000
```

Backend:

`http://localhost:8000`

Swagger:

`http://localhost:8000/docs`

## 6. Frontend Setup

Open another terminal in the frontend directory.

### Install dependencies

```powershell
npm install
```

### Configure environment

Create `.env`:

```dotenv
VITE_API_BASE_URL=http://localhost:8000/api/v1
```

### Start React development server

```powershell
npm run dev
```

Frontend:

`http://localhost:5173`

## 7. Application Workflow

1. Register or log in.
2. Create a project.
3. Add team members.
4. Create bugs, tasks, or features.
5. Assign issues to developers.
6. Move issues across Kanban columns.
7. Add comments and attachments.
8. Review dashboard statistics and activity history.

## 8. Testing

Backend tests:

```powershell
pytest
```

Frontend production build:

```powershell
npm run build
```

## 9. Important Notes

- Never commit `.env` files.
- Never store plain-text passwords.
- Use backend role checks for protected operations.
- Configure production CORS origins before deployment.
- Use database migrations when changing models.
- Store uploaded files securely.
- Configure production secrets separately from development secrets.

## 10. Development Status

This guide describes the intended local setup. Confirm that all routers, endpoints, migrations, and frontend services have been implemented before considering the application fully operational.
