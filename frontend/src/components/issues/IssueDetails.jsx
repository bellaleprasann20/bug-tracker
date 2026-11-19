
import React from "react";
import {
  FaBug,
  FaCheckCircle,
  FaClock,
  FaEdit,
  FaTrash,
  FaUser,
  FaCalendarAlt,
  FaFlag,
  FaFolder,
} from "react-icons/fa";

const statusStyles = {
  TODO: "bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-300",
  IN_PROGRESS: "bg-blue-100 text-blue-700 dark:bg-blue-500/15 dark:text-blue-300",
  IN_REVIEW: "bg-amber-100 text-amber-700 dark:bg-amber-500/15 dark:text-amber-300",
  DONE: "bg-emerald-100 text-emerald-700 dark:bg-emerald-500/15 dark:text-emerald-300",
};

const priorityStyles = {
  LOW: "text-slate-500",
  MEDIUM: "text-blue-500",
  HIGH: "text-orange-500",
  CRITICAL: "text-red-500",
};

const formatLabel = (value = "") =>
  value
    .toLowerCase()
    .replaceAll("_", " ")
    .replace(/\b\w/g, (letter) => letter.toUpperCase());

const formatDate = (value) => {
  if (!value) return "Not set";

  const date = new Date(value);

  if (Number.isNaN(date.getTime())) return "Not set";

  return date.toLocaleDateString();
};

function DetailRow({ icon: Icon, label, children }) {
  return (
    <div className="flex items-start gap-3">
      <Icon className="mt-0.5 shrink-0 text-slate-400" />
      <div className="min-w-0">
        <p className="text-xs text-slate-500 dark:text-slate-400">
          {label}
        </p>
        <div className="mt-1 text-sm font-medium text-slate-800 dark:text-slate-200">
          {children}
        </div>
      </div>
    </div>
  );
}

export default function IssueDetails({
  issue,
  onEdit,
  onDelete,
  canEdit = true,
  canDelete = true,
}) {
  if (!issue) {
    return (
      <div className="rounded-xl border border-slate-200 bg-white p-8 text-center text-sm text-slate-500 dark:border-slate-800 dark:bg-slate-900 dark:text-slate-400">
        No issue selected.
      </div>
    );
  }

  const status = issue.status || "TODO";
  const priority = issue.priority || "MEDIUM";

  const assignee =
    issue.assignee?.full_name ||
    issue.assignee?.name ||
    issue.assignee_name ||
    "Unassigned";

  const reporter =
    issue.reporter?.full_name ||
    issue.reporter?.name ||
    issue.reporter_name ||
    "Unknown";

  return (
    <div className="space-y-6 rounded-xl border border-slate-200 bg-white p-5 dark:border-slate-800 dark:bg-slate-900 sm:p-6">
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <div className="mb-2 flex flex-wrap items-center gap-2">
            <span className="text-xs font-semibold uppercase tracking-wide text-indigo-600 dark:text-indigo-400">
              {issue.issue_key || "Issue"}
            </span>

            <span className="rounded-full bg-slate-100 px-2.5 py-1 text-xs font-medium text-slate-600 dark:bg-slate-800 dark:text-slate-300">
              {formatLabel(issue.type || "BUG")}
            </span>
          </div>

          <h2 className="text-xl font-bold text-slate-900 dark:text-white">
            {issue.title}
          </h2>
        </div>

        <div className="flex gap-2">
          {canEdit && (
            <ButtonAction
              label="Edit issue"
              onClick={() => onEdit?.(issue)}
              icon={<FaEdit />}
            />
          )}

          {canDelete && (
            <ButtonAction
              label="Delete issue"
              danger
              onClick={() => onDelete?.(issue)}
              icon={<FaTrash />}
            />
          )}
        </div>
      </div>

      <div className="flex flex-wrap items-center gap-3">
        <span
          className={`rounded-full px-3 py-1.5 text-xs font-semibold ${
            statusStyles[status] || statusStyles.TODO
          }`}
        >
          {formatLabel(status)}
        </span>

        <span
          className={`flex items-center gap-2 text-sm font-semibold ${
            priorityStyles[priority] || priorityStyles.MEDIUM
          }`}
        >
          <FaFlag />
          {formatLabel(priority)}
        </span>
      </div>

      <div className="border-t border-slate-200 pt-5 dark:border-slate-800">
        <h3 className="mb-2 text-sm font-semibold text-slate-800 dark:text-white">
          Description
        </h3>

        <p className="whitespace-pre-wrap text-sm leading-7 text-slate-600 dark:text-slate-300">
          {issue.description || "No description provided."}
        </p>
      </div>

      <div className="grid grid-cols-1 gap-5 border-t border-slate-200 pt-5 sm:grid-cols-2 dark:border-slate-800">
        <DetailRow icon={FaUser} label="Assignee">
          {assignee}
        </DetailRow>

        <DetailRow icon={FaUser} label="Reporter">
          {reporter}
        </DetailRow>

        <DetailRow icon={FaFolder} label="Project">
          {issue.project?.name ||
            issue.project_name ||
            issue.project_id ||
            "Not available"}
        </DetailRow>

        <DetailRow icon={FaCalendarAlt} label="Due date">
          {formatDate(issue.due_date)}
        </DetailRow>

        <DetailRow icon={FaClock} label="Story points">
          {issue.story_points ?? "Not estimated"}
        </DetailRow>

        <DetailRow icon={FaCheckCircle} label="Created">
          {formatDate(issue.created_at)}
        </DetailRow>
      </div>

      {issue.labels?.length > 0 && (
        <div className="border-t border-slate-200 pt-5 dark:border-slate-800">
          <h3 className="mb-3 text-sm font-semibold text-slate-800 dark:text-white">
            Labels
          </h3>

          <div className="flex flex-wrap gap-2">
            {issue.labels.map((label) => (
              <span
                key={label}
                className="rounded-full bg-indigo-50 px-3 py-1 text-xs font-medium text-indigo-700 dark:bg-indigo-500/15 dark:text-indigo-300"
              >
                {label}
              </span>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

function ButtonAction({ icon, label, onClick, danger = false }) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-label={label}
      title={label}
      className={`rounded-lg border p-2 transition ${
        danger
          ? "border-red-200 text-red-500 hover:bg-red-50 dark:border-red-500/30 dark:hover:bg-red-500/10"
          : "border-slate-200 text-slate-600 hover:bg-slate-100 dark:border-slate-700 dark:text-slate-300 dark:hover:bg-slate-800"
      }`}
    >
      {icon}
    </button>
  );
}
