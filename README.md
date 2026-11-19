
# 🐛 Bug Tracker

A full-stack Bug Tracking and Issue Management System inspired by Jira, Linear, and ClickUp.

The platform helps development teams organize projects, report bugs, assign tasks, collaborate through comments, and track progress using a Kanban board.

## 🚀 Features

### Authentication
- User registration and login
- JWT-based authentication
- Password hashing
- Role-based access control

### Project Management
- Create and manage projects
- Add and remove team members
- Manage project membership and roles

### Issue Management
- Create bugs, tasks, and feature requests
- Assign issues to developers
- Set priorities and deadlines
- Track issue status
- Search and filter issues

### Kanban Board
- Drag-and-drop issue management
- To Do
- In Progress
- In Review
- Done

### Collaboration
- Issue comments
- Threaded replies
- File attachments
- Activity history

### Dashboard
- Project statistics
- Issue status distribution
- Recent activity
- Progress monitoring

## 🛠️ Technology Stack

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

### Development Tools
- Git and GitHub
- Docker
- Docker Compose
- Swagger UI

## 📁 Project Structure

```text
bug-tracker/
│
├── backend/
│   ├── app/
│   │   ├── models/
│   │   ├── schemas/
│   │   ├── routers/
│   │   ├── services/
│   │   ├── repositories/
│   │   ├── utils/
│   │   ├── config.py
│   │   ├── database.py
│   │   ├── dependencies.py
│   │   └── main.py
│   ├── tests/
│   ├── uploads/
│   ├── alembic/
│   ├── requirements.txt
│   └── .env.example
│
├── frontend/
│   ├── public/
│   ├── src/
│   │   ├── assets/
│   │   ├── components/
│   │   ├── pages/
│   │   ├── hooks/
│   │   ├── context/
│   │   ├── services/
│   │   ├── routes/
│   │   └── utils/
│   ├── package.json
│   └── vite.config.js
│
├── docs/
│   ├── API_DOCUMENTATION.md
│   ├── DATABASE_SCHEMA.md
│   └── PROJECT_SETUP.md
│
├── .gitignore
├── README.md
└── docker-compose.yml
```

## ⚙️ Installation and Setup

### Prerequisites

- Node.js and npm
- Python 3.11+
- PostgreSQL
- Git

### 1. Clone the repository

```bash
git clone <YOUR_GITHUB_REPOSITORY_URL>
cd bug-tracker
```

### 2. Backend setup

```powershell
cd backend

python -m venv .venv
.\.venv\Scripts\Activate.ps1

pip install -r requirements.txt

Copy-Item .env.example .env
```

Configure your database URL and JWT secret in `.env`.

Create the PostgreSQL database named `bug_tracker`, then run:

```powershell
alembic upgrade head
```

Start the API:

```powershell
uvicorn app.main:app --reload
```

### 3. Frontend setup

Open another terminal:

```powershell
cd frontend

npm install

npm run dev
```

### 4. Open the application

| Service | URL |
|---|---|
| Frontend | http://localhost:5173 |
| Backend | http://localhost:8000 |
| Swagger API | http://localhost:8000/docs |
| ReDoc | http://localhost:8000/redoc |

## 🐳 Docker Setup

Start PostgreSQL and backend services:

```bash
docker compose up --build
```

Stop services:

```bash
docker compose down
```

See `docker-compose.yml` for service configuration.

## 🧪 Testing

Backend:

```powershell
cd backend
pytest
```

Frontend:

```powershell
cd frontend
npm run build
```

## 🔐 Security

- Passwords are hashed before storage.
- Protected API endpoints require JWT authentication.
- Role-based authorization is enforced by the backend.
- Environment secrets are excluded from Git.
- File uploads are validated.

## 📚 Documentation

- [API Documentation](docs/API_DOCUMENTATION.md)
- [Database Schema](docs/DATABASE_SCHEMA.md)
- [Project Setup](docs/PROJECT_SETUP.md)

## 👨‍💻 Author

**Prasann Bellale**

GitHub: https://github.com/bellaleprasann20

LinkedIn: https://www.linkedin.com/in/prasann-bellale/

## 📄 License

This project is developed for educational and portfolio purposes.
