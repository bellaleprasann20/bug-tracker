
import React from "react";
import { useSortable } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import {
  FaBug,
  FaCheckCircle,
  FaClipboardList,
  FaLightbulb,
  FaGripVertical,
  FaCalendarAlt,
  FaUserCircle,
} from "react-icons/fa";

const priorityStyles = {
  LOW: "bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-300",
  MEDIUM: "bg-blue-100 text-blue-700 dark:bg-blue-500/15 dark:text-blue-300",
  HIGH: "bg-orange-100 text-orange-700 dark:bg-orange-500/15 dark:text-orange-300",
  CRITICAL: "bg-red-100 text-red-700 dark:bg-red-500/15 dark:text-red-300",
};

const typeConfig = {
  BUG: {
    label: "Bug",
    icon: FaBug,
    color: "text-red-500",
  },
  TASK: {
    label: "Task",
    icon: FaClipboardList,
    color: "text-blue-500",
  },
  FEATURE: {
    label: "Feature",
    icon: FaLightbulb,
    color: "text-purple-500",
  },
};

export default function IssueCard({
  issue,
  onClick,
  isOverlay = false,
}) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({
    id: String(issue.id),
    disabled: isOverlay,
  });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.35 : 1,
  };

  const priority = String(
    issue.priority || "MEDIUM"
  ).toUpperCase();

  const type = String(
    issue.type || "TASK"
  ).toUpperCase();

  const typeDetails = typeConfig[type] || typeConfig.TASK;
  const TypeIcon = typeDetails.icon;

  const assignee =
    issue.assignee?.full_name ||
    issue.assignee?.name ||
    issue.assignee_name ||
    null;

  const initials = assignee
    ? assignee
        .split(" ")
        .filter(Boolean)
        .slice(0, 2)
        .map((part) => part[0].toUpperCase())
        .join("")
    : "";

  const formattedDate = issue.due_date
    ? new Date(issue.due_date).toLocaleDateString(
        undefined,
        {
          day: "numeric",
          month: "short",
        }
      )
    : null;

  const isOverdue =
    issue.due_date &&
    new Date(issue.due_date) < new Date() &&
    String(issue.status).toUpperCase() !== "DONE";

  return (
    <article
      ref={setNodeRef}
      style={style}
      onClick={() => onClick?.(issue)}
      onKeyDown={(event) => {
        if (
          event.target === event.currentTarget &&
          (event.key === "Enter" || event.key === " ")
        ) {
          event.preventDefault();
          onClick?.(issue);
        }
      }}
      role={onClick ? "button" : undefined}
      tabIndex={onClick ? 0 : undefined}
      className={`
        group rounded-xl border border-slate-200
        bg-white p-4 shadow-sm transition-all
        dark:border-slate-800 dark:bg-slate-900
        ${
          isOverlay
            ? "rotate-2 cursor-grabbing shadow-xl"
            : "cursor-pointer hover:-translate-y-0.5 hover:border-indigo-300 hover:shadow-md dark:hover:border-indigo-500/50"
        }
      `}
    >
      <div className="mb-3 flex items-center justify-between gap-2">
        <div className="flex min-w-0 items-center gap-2">
          <TypeIcon
            className={`shrink-0 text-sm ${typeDetails.color}`}
          />

          <span className="truncate text-xs font-semibold text-slate-500 dark:text-slate-400">
            {issue.issue_key || "ISSUE"}
          </span>
        </div>

        <button
          type="button"
          {...attributes}
          {...listeners}
          onClick={(event) => event.stopPropagation()}
          onPointerDown={(event) => event.stopPropagation()}
          className="cursor-grab rounded p-1.5 text-slate-400 opacity-60 transition hover:bg-slate-100 hover:text-slate-700 active:cursor-grabbing dark:hover:bg-slate-800 dark:hover:text-white sm:opacity-0 sm:group-hover:opacity-100"
          aria-label={`Drag issue ${issue.issue_key || issue.title}`}
          title="Drag to change status"
        >
          <FaGripVertical />
        </button>
      </div>

      <h3 className="mb-3 line-clamp-2 text-sm font-semibold leading-5 text-slate-800 dark:text-slate-100">
        {issue.title}
      </h3>

      <div className="mb-4 flex flex-wrap items-center gap-2">
        <span
          className={`rounded-md px-2 py-1 text-[10px] font-bold uppercase tracking-wide ${
            priorityStyles[priority] || priorityStyles.MEDIUM
          }`}
        >
          {priority}
        </span>

        <span className="rounded-md bg-slate-100 px-2 py-1 text-[10px] font-semibold text-slate-600 dark:bg-slate-800 dark:text-slate-300">
          {typeDetails.label}
        </span>
      </div>

      <div className="flex items-center justify-between gap-2 border-t border-slate-100 pt-3 dark:border-slate-800">
        <div className="flex min-w-0 items-center gap-2">
          {assignee ? (
            <>
              <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-indigo-100 text-[10px] font-bold text-indigo-700 dark:bg-indigo-500/20 dark:text-indigo-300">
                {initials}
              </div>

              <span className="truncate text-xs text-slate-500 dark:text-slate-400">
                {assignee}
              </span>
            </>
          ) : (
            <span className="flex items-center gap-1 text-xs text-slate-400">
              <FaUserCircle />
              Unassigned
            </span>
          )}
        </div>

        {formattedDate && (
          <span
            className={`flex shrink-0 items-center gap-1 text-xs ${
              isOverdue
                ? "font-semibold text-red-500"
                : "text-slate-400"
            }`}
          >
            <FaCalendarAlt />
            {formattedDate}
          </span>
        )}
      </div>

      {issue.story_points != null && (
        <div className="mt-3 flex justify-end">
          <span className="rounded-full bg-indigo-50 px-2 py-0.5 text-[10px] font-semibold text-indigo-700 dark:bg-indigo-500/10 dark:text-indigo-300">
            {issue.story_points} points
          </span>
        </div>
      )}
    </article>
  );
}
