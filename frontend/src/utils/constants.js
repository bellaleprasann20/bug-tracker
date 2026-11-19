
export const APP_NAME = "Bug Tracker";

export const ISSUE_STATUS = {
  TODO: "TODO",
  IN_PROGRESS: "IN_PROGRESS",
  IN_REVIEW: "IN_REVIEW",
  DONE: "DONE",
};

export const ISSUE_STATUS_OPTIONS = [
  { value: ISSUE_STATUS.TODO, label: "To Do" },
  { value: ISSUE_STATUS.IN_PROGRESS, label: "In Progress" },
  { value: ISSUE_STATUS.IN_REVIEW, label: "In Review" },
  { value: ISSUE_STATUS.DONE, label: "Done" },
];

export const ISSUE_PRIORITY = {
  LOW: "LOW",
  MEDIUM: "MEDIUM",
  HIGH: "HIGH",
  CRITICAL: "CRITICAL",
};

export const ISSUE_PRIORITY_OPTIONS = [
  { value: ISSUE_PRIORITY.LOW, label: "Low" },
  { value: ISSUE_PRIORITY.MEDIUM, label: "Medium" },
  { value: ISSUE_PRIORITY.HIGH, label: "High" },
  { value: ISSUE_PRIORITY.CRITICAL, label: "Critical" },
];

export const ISSUE_TYPE = {
  BUG: "BUG",
  TASK: "TASK",
  FEATURE: "FEATURE",
};

export const ISSUE_TYPE_OPTIONS = [
  { value: ISSUE_TYPE.BUG, label: "Bug" },
  { value: ISSUE_TYPE.TASK, label: "Task" },
  { value: ISSUE_TYPE.FEATURE, label: "Feature" },
];

export const USER_ROLE = {
  ADMIN: "admin",
  DEVELOPER: "developer",
  VIEWER: "viewer",
};

export const USER_ROLE_OPTIONS = [
  { value: USER_ROLE.ADMIN, label: "Admin" },
  { value: USER_ROLE.DEVELOPER, label: "Developer" },
  { value: USER_ROLE.VIEWER, label: "Viewer" },
];

export const PROJECT_STATUS = {
  ACTIVE: "ACTIVE",
  COMPLETED: "COMPLETED",
  ARCHIVED: "ARCHIVED",
};

export const PROJECT_STATUS_OPTIONS = [
  { value: PROJECT_STATUS.ACTIVE, label: "Active" },
  { value: PROJECT_STATUS.COMPLETED, label: "Completed" },
  { value: PROJECT_STATUS.ARCHIVED, label: "Archived" },
];

export const PAGINATION = {
  DEFAULT_PAGE: 1,
  DEFAULT_PAGE_SIZE: 10,
  MAX_PAGE_SIZE: 100,
};

export const FILE_UPLOAD = {
  MAX_SIZE: 10 * 1024 * 1024,
  MAX_SIZE_MB: 10,
  ALLOWED_TYPES: [
    "image/jpeg",
    "image/png",
    "image/gif",
    "image/webp",
    "application/pdf",
  ],
};

export const ROUTES = {
  LOGIN: "/login",
  REGISTER: "/register",
  DASHBOARD: "/dashboard",
  PROJECTS: "/projects",
  ISSUES: "/issues",
  KANBAN: "/kanban",
  TEAM: "/team",
};
