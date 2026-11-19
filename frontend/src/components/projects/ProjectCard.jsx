
import React from "react";
import { Link } from "react-router-dom";
import {
  FaFolder,
  FaBug,
  FaUsers,
  FaArrowRight,
  FaEdit,
  FaTrash,
} from "react-icons/fa";

const statusStyles = {
  active:
    "bg-emerald-100 text-emerald-700 dark:bg-emerald-500/15 dark:text-emerald-300",
  archived:
    "bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-300",
  completed:
    "bg-blue-100 text-blue-700 dark:bg-blue-500/15 dark:text-blue-300",
};

export default function ProjectCard({
  project,
  onEdit,
  onDelete,
  canManage = false,
}) {
  if (!project) return null;

  const status = (project.status || "active").toLowerCase();

  return (
    <article className="group flex flex-col rounded-xl border border-slate-200 bg-white p-5 transition-all duration-200 hover:-translate-y-1 hover:border-indigo-300 hover:shadow-lg dark:border-slate-800 dark:bg-slate-900 dark:hover:border-indigo-500/50">
      <div className="flex items-start justify-between gap-3">
        <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-indigo-50 text-lg text-indigo-600 dark:bg-indigo-500/15 dark:text-indigo-400">
          <FaFolder />
        </div>

        <div className="flex items-center gap-2">
          <span
            className={`rounded-full px-2.5 py-1 text-xs font-semibold capitalize ${
              statusStyles[status] || statusStyles.active
            }`}
          >
            {status}
          </span>

          {canManage && (
            <div className="flex gap-1">
              <button
                type="button"
                onClick={() => onEdit?.(project)}
                aria-label="Edit project"
                title="Edit project"
                className="rounded-lg p-2 text-slate-400 transition hover:bg-slate-100 hover:text-indigo-600 dark:hover:bg-slate-800"
              >
                <FaEdit />
              </button>

              <button
                type="button"
                onClick={() => onDelete?.(project)}
                aria-label="Delete project"
                title="Delete project"
                className="rounded-lg p-2 text-slate-400 transition hover:bg-red-50 hover:text-red-600 dark:hover:bg-red-500/10"
              >
                <FaTrash />
              </button>
            </div>
          )}
        </div>
      </div>

      <div className="mt-4">
        <p className="text-xs font-bold uppercase tracking-wider text-indigo-600 dark:text-indigo-400">
          {project.key}
        </p>

        <h3 className="mt-1 text-lg font-bold text-slate-900 dark:text-white">
          {project.name}
        </h3>

        <p className="mt-2 line-clamp-2 min-h-10 text-sm leading-5 text-slate-500 dark:text-slate-400">
          {project.description || "No project description provided."}
        </p>
      </div>

      <div className="mt-5 grid grid-cols-2 gap-3 border-t border-slate-100 pt-4 dark:border-slate-800">
        <div className="flex items-center gap-2">
          <FaBug className="text-slate-400" />
          <div>
            <p className="text-xs text-slate-400">Issues</p>
            <p className="text-sm font-semibold text-slate-800 dark:text-white">
              {project.issue_count ?? project.issues_count ?? 0}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <FaUsers className="text-slate-400" />
          <div>
            <p className="text-xs text-slate-400">Members</p>
            <p className="text-sm font-semibold text-slate-800 dark:text-white">
              {project.member_count ?? project.members_count ?? 0}
            </p>
          </div>
        </div>
      </div>

      <Link
        to={`/projects/${project.id}`}
        className="mt-5 flex items-center justify-between rounded-lg bg-slate-50 px-3 py-2.5 text-sm font-semibold text-slate-700 transition hover:bg-indigo-50 hover:text-indigo-700 dark:bg-slate-800 dark:text-slate-200 dark:hover:bg-indigo-500/15 dark:hover:text-indigo-300"
      >
        View Project
        <FaArrowRight className="text-xs transition-transform group-hover:translate-x-1" />
      </Link>
    </article>
  );
}
