
# Bug Tracker API Documentation

## 1. Overview

The Bug Tracker API provides REST endpoints for authentication, project management, team members, issue tracking, comments, attachments, activities, and dashboard analytics.

**Base URL (local):**
`http://localhost:8000/api/v1`

**API documentation:**
- Swagger UI: `http://localhost:8000/docs`
- ReDoc: `http://localhost:8000/redoc`

## 2. Authentication

Authentication uses JWT Bearer tokens.

For protected endpoints, include:

`Authorization: Bearer <access_token>`

### Authentication endpoints

| Method | Endpoint | Description |
|---|---|---|
| POST | `/auth/register` | Register a developer |
| POST | `/auth/login` | Login and receive JWT |

### User endpoints

| Method | Endpoint | Description |
|---|---|---|
| GET | `/users/me` | Get current user |
| PATCH | `/users/me` | Update current profile |
| GET | `/users` | List users (admin) |
| GET | `/users/{user_id}` | Get user details |
| PATCH | `/users/{user_id}` | Update user (admin) |
| DELETE | `/users/{user_id}` | Delete user (admin) |

## 3. Project Management

| Method | Endpoint | Description |
|---|---|---|
| POST | `/projects` | Create project |
| GET | `/projects` | List accessible projects |
| GET | `/projects/{project_id}` | Get project details |
| PATCH | `/projects/{project_id}` | Update project |
| DELETE | `/projects/{project_id}` | Delete project |

## 4. Project Members

| Method | Endpoint | Description |
|---|---|---|
| GET | `/projects/{project_id}/members` | List project members |
| POST | `/projects/{project_id}/members` | Add a project member |
| PATCH | `/projects/{project_id}/members/{user_id}` | Update member role |
| DELETE | `/projects/{project_id}/members/{user_id}` | Remove member |

## 5. Issue Management

| Method | Endpoint | Description |
|---|---|---|
| POST | `/issues` | Create issue |
| GET | `/issues` | List and filter issues |
| GET | `/issues/{issue_id}` | Get issue details |
| PATCH | `/issues/{issue_id}` | Update issue |
| DELETE | `/issues/{issue_id}` | Delete issue |
| GET | `/issues/{issue_id}/activities` | Get issue activity history |

### Issue query parameters

- `project_id`
- `status`
- `priority`
- `type`
- `assignee_id`
- `reporter_id`
- `search`
- `page`
- `page_size`

### Supported issue types

- `BUG`
- `TASK`
- `FEATURE`

### Supported issue statuses

- `TODO`
- `IN_PROGRESS`
- `IN_REVIEW`
- `DONE`

### Supported priorities

- `LOW`
- `MEDIUM`
- `HIGH`
- `CRITICAL`

## 6. Comments

| Method | Endpoint | Description |
|---|---|---|
| GET | `/issues/{issue_id}/comments` | List issue comments |
| POST | `/issues/{issue_id}/comments` | Add comment or reply |
| PATCH | `/comments/{comment_id}` | Edit comment |
| DELETE | `/comments/{comment_id}` | Delete comment |

Threaded replies use the optional `parent_id` field.

## 7. Attachments

| Method | Endpoint | Description |
|---|---|---|
| POST | `/issues/{issue_id}/attachments` | Upload attachment |
| GET | `/issues/{issue_id}/attachments` | List attachments |
| GET | `/attachments/{attachment_id}` | Download attachment |
| DELETE | `/attachments/{attachment_id}` | Delete attachment |

Uploads use `multipart/form-data`.

## 8. Dashboard and Activities

| Method | Endpoint | Description |
|---|---|---|
| GET | `/dashboard/stats` | Dashboard statistics |
| GET | `/activities` | Activity feed |

## 9. Roles and Permissions

| Feature | Admin | Developer | Viewer |
|---|---|---|---|
| View projects | Yes | Yes | Yes |
| Create projects | Yes | Yes | No |
| Manage project members | Yes | Restricted | No |
| Create issues | Yes | Yes | No |
| Update issues | Yes | Yes, subject to access | No |
| Delete issues | Yes | Restricted | No |
| Comment on issues | Yes | Yes | No |
| View issues | Yes | Yes | Yes |
| Manage users | Yes | No | No |

Actual permissions must be enforced by the backend, not only by the frontend.

## 10. Standard Response Format

Successful responses return JSON.

Errors should use a consistent structure:

```json
{
  "detail": "A descriptive error message"
}
```

Paginated list responses should include:

- `items`
- `total`
- `page`
- `page_size`
- `total_pages`

**Implementation note:** This document describes the intended API contract. Confirm endpoint paths and response fields against the implemented FastAPI routers before treating every endpoint as available.
