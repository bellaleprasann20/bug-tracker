
import React from "react";
import { useDroppable } from "@dnd-kit/core";
import {
  SortableContext,
  verticalListSortingStrategy,
} from "@dnd-kit/sortable";
import { FaPlus } from "react-icons/fa";
import IssueCard from "./IssueCard";

const columnStyles = {
  TODO: {
    dot: "bg-slate-400",
    badge: "bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-300",
  },
  IN_PROGRESS: {
    dot: "bg-blue-500",
    badge: "bg-blue-100 text-blue-700 dark:bg-blue-500/15 dark:text-blue-300",
  },
  IN_REVIEW: {
    dot: "bg-orange-500",
    badge: "bg-orange-100 text-orange-700 dark:bg-orange-500/15 dark:text-orange-300",
  },
  DONE: {
    dot: "bg-emerald-500",
    badge: "bg-emerald-100 text-emerald-700 dark:bg-emerald-500/15 dark:text-emerald-300",
  },
};

export default function KanbanColumn({
  status,
  title,
  issues = [],
  onIssueClick,
  onAddIssue,
}) {
  const { setNodeRef, isOver } = useDroppable({
    id: status,
    data: {
      type: "column",
      status,
    },
  });

  const styles = columnStyles[status] || columnStyles.TODO;

  const issueIds = issues.map((issue) => String(issue.id));

  return (
    <section className="flex min-h-[500px] min-w-[270px] flex-1 flex-col rounded-xl bg-slate-100/80 p-3 dark:bg-slate-900/60">
      <div className="mb-4 flex items-center justify-between px-1">
        <div className="flex items-center gap-2">
          <span className={`h-2.5 w-2.5 rounded-full ${styles.dot}`} />

          <h3 className="text-sm font-bold text-slate-800 dark:text-white">
            {title}
          </h3>

          <span className={`rounded-full px-2 py-0.5 text-xs font-semibold ${styles.badge}`}>
            {issues.length}
          </span>
        </div>

        {onAddIssue && (
          <button
            type="button"
            onClick={() => onAddIssue(status)}
            className="rounded-lg p-2 text-slate-400 transition hover:bg-white hover:text-indigo-600 dark:hover:bg-slate-800 dark:hover:text-indigo-400"
            aria-label={`Add issue to ${title}`}
            title={`Add issue to ${title}`}
          >
            <FaPlus className="text-xs" />
          </button>
        )}
      </div>

      <div
        ref={setNodeRef}
        className={`flex flex-1 flex-col gap-3 rounded-lg transition-colors ${
          isOver
            ? "bg-indigo-50/80 ring-2 ring-inset ring-indigo-300 dark:bg-indigo-500/10 dark:ring-indigo-500/50"
            : ""
        }`}
      >
        <SortableContext
          items={issueIds}
          strategy={verticalListSortingStrategy}
        >
          {issues.map((issue) => (
            <IssueCard
              key={issue.id}
              issue={issue}
              onClick={onIssueClick}
            />
          ))}
        </SortableContext>

        {issues.length === 0 && (
          <div className="flex min-h-36 flex-1 items-center justify-center rounded-xl border-2 border-dashed border-slate-200 px-3 dark:border-slate-800">
            <p className="text-center text-xs text-slate-400">
              No issues here. Drag an issue into this column.
            </p>
          </div>
        )}
      </div>
    </section>
  );
}
