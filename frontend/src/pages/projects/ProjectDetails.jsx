
import React, { useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";
import {
  FaArrowLeft,
  FaFolder,
  FaBug,
  FaUsers,
  FaPlus,
  FaCalendarAlt,
  FaExclamationCircle,
  FaSyncAlt,
} from "react-icons/fa";

import Loader from "../../components/common/Loader";
import MemberList from "../../components/projects/MemberList";
import { getProjectById } from "../../services/projectService";
import { getIssues } from "../../services/issueService";

const STATUS_STYLES = {
  TODO: "bg-slate-100 text-slate-700 dark:bg-slate-700 dark:text-slate-300",
  IN_PROGRESS: "bg-blue-100 text-blue-700 dark:bg-blue-500/10 dark:text-blue-400",
  IN_REVIEW: "bg-orange-100 text-orange-700 dark:bg-orange-500/10 dark:text-orange-400",
  DONE: "bg-emerald-100 text-emerald-700 dark:bg-emerald-500/10 dark:text-emerald-400",
};

const PRIORITY_STYLES = {
  LOW: "text-slate-500",
  MEDIUM: "text-blue-600 dark:text-blue-400",
  HIGH: "text-orange-600 dark:text-orange-400",
  CRITICAL: "text-red-600 dark:text-red-400",
};

function formatDate(value) {
  if (!value) return "Not specified";

  const date = new Date(value);

  if (Number.isNaN(date.getTime())) return "Not specified";

  return date.toLocaleDateString(undefined, {
    year: "numeric",
    month: "short",
    day: "numeric",
  });
}

export default function ProjectDetails() {
  const { projectId } = useParams();

  const [project, setProject] = useState(null);
  const [issues, setIssues] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const fetchDetails = async () => {
    setLoading(true);
    setError("");

    try {
      const [projectResponse, issueResponse] = await Promise.all([
        getProjectById(projectId),
        getIssues({ project_id: projectId }),
      ]);

      setProject(projectResponse);

      const issueList = Array.isArray(issueResponse)
        ? issueResponse
        : issueResponse?.items || issueResponse?.issues || [];

      setIssues(issueList);
    } catch (err) {
      setError(
        err?.response?.data?.detail ||
          "Unable to load project details."
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDetails();
  }, [projectId]);

  if (loading) {
    return <Loader fullscreen message="Loading project details..." />;
  }

  if (error || !project) {
    return (
      <div className="rounded-2xl border border-red-200 bg-red-50 p-6 dark:border-red-500/30 dark:bg-red-500/10">
        <div className="flex items-center gap-2 text-red-600 dark:text-red-400">
          <FaExclamationCircle />
          <p className="text-sm font-medium">
            {error || "Project not found."}
          </p>
        </div>

        <div className="mt-4 flex gap-4">
          <button
            type="button"
            onClick={fetchDetails}
            className="inline-flex items-center gap-2 text-sm font-semibold text-red-600 underline dark:text-red-400"
          >
            <FaSyncAlt />
            Retry
          </button>

          <Link
            to="/projects"
            className="text-sm font-semibold text-indigo-600 underline dark:text-indigo-400"
          >
            Back to projects
          </Link>
        </div>
      </div>
    );
  }

  const members = project.members || project.project_members || [];

  return (
    <div className="space-y-7">
      <Link
        to="/projects"
        className="inline-flex items-center gap-2 text-sm font-medium text-slate-500 transition hover:text-indigo-600 dark:text-slate-400 dark:hover:text-indigo-400"
      >
        <FaArrowLeft />
        Back to Projects
      </Link>

      {/* Project heading */}
      <section className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm dark:border-slate-800 dark:bg-slate-900">
        <div className="flex flex-col gap-5 sm:flex-row sm:items-start sm:justify-between">
          <div className="flex items-start gap-4">
            <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl bg-indigo-50 text-2xl text-indigo-600 dark:bg-indigo-500/10 dark:text-indigo-400">
              <FaFolder />
            </div>

            <div className="min-w-0">
              <p className="text-xs font-bold uppercase tracking-wider text-indigo-600 dark:text-indigo-400">
                {project.key}
              </p>

              <h1 className="mt-1 text-2xl font-bold text-slate-900 dark:text-white">
                {project.name}
              </h1>

              <p className="mt-2 max-w-2xl text-sm leading-6 text-slate-500 dark:text-slate-400">
                {project.description || "No project description provided."}
              </p>
            </div>
          </div>

          <Link
            to={`/issues/create?project_id=${project.id}`}
            className="inline-flex shrink-0 items-center justify-center gap-2 rounded-xl bg-indigo-600 px-4 py-3 text-sm font-semibold text-white transition hover:bg-indigo-700"
          >
            <FaPlus />
            Create Issue
          </Link>
        </div>

        <div className="mt-7 grid grid-cols-1 gap-4 border-t border-slate-100 pt-6 dark:border-slate-800 sm:grid-cols-3">
          <div className="flex items-center gap-3">
            <FaBug className="text-indigo-500" />
            <div>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Total Issues
              </p>
              <p className="font-semibold text-slate-900 dark:text-white">
                {issues.length}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <FaUsers className="text-indigo-500" />
            <div>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Project Members
              </p>
              <p className="font-semibold text-slate-900 dark:text-white">
                {members.length}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <FaCalendarAlt className="text-indigo-500" />
            <div>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Created
              </p>
              <p className="font-semibold text-slate-900 dark:text-white">
                {formatDate(project.created_at)}
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Members */}
      <section className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm dark:border-slate-800 dark:bg-slate-900">
        <div className="mb-5 flex items-center justify-between">
          <div>
            <h2 className="text-lg font-semibold text-slate-900 dark:text-white">
              Project Members
            </h2>
            <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
              People collaborating on this project.
            </p>
          </div>
        </div>

        <MemberList members={members} />
      </section>

      {/* Issues */}
      <section className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm dark:border-slate-800 dark:bg-slate-900">
        <div className="mb-5 flex items-center justify-between">
          <div>
            <h2 className="text-lg font-semibold text-slate-900 dark:text-white">
              Project Issues
            </h2>
            <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
              Issues associated with this project.
            </p>
          </div>

          <Link
            to="/issues"
            className="text-sm font-semibold text-indigo-600 hover:text-indigo-700 dark:text-indigo-400"
          >
            View all
          </Link>
        </div>

        {issues.length > 0 ? (
          <div className="overflow-x-auto">
            <table className="w-full min-w-[650px] text-left">
              <thead>
                <tr className="border-b border-slate-100 text-xs uppercase tracking-wider text-slate-500 dark:border-slate-800 dark:text-slate-400">
                  <th className="px-3 py-3 font-semibold">Issue</th>
                  <th className="px-3 py-3 font-semibold">Assignee</th>
                  <th className="px-3 py-3 font-semibold">Priority</th>
                  <th className="px-3 py-3 font-semibold">Status</th>
                  <th className="px-3 py-3 font-semibold">Due Date</th>
                </tr>
              </thead>

              <tbody>
                {issues.map((issue) => (
                  <tr
                    key={issue.id}
                    className="border-b border-slate-100 last:border-0 dark:border-slate-800"
                  >
                    <td className="px-3 py-4">
                      <Link
                        to={`/issues/${issue.id}`}
                        className="font-medium text-slate-800 hover:text-indigo-600 dark:text-slate-100 dark:hover:text-indigo-400"
                      >
                        {issue.title}
                      </Link>

                      <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">
                        {issue.issue_key}
                      </p>
                    </td>

                    <td className="px-3 py-4 text-sm text-slate-600 dark:text-slate-300">
                      {issue.assignee?.full_name ||
                        issue.assignee?.name ||
                        "Unassigned"}
                    </td>

                    <td className={`px-3 py-4 text-xs font-semibold ${PRIORITY_STYLES[issue.priority] || PRIORITY_STYLES.LOW}`}>
                      {issue.priority || "LOW"}
                    </td>

                    <td className="px-3 py-4">
                      <span className={`rounded-full px-3 py-1 text-xs font-medium ${STATUS_STYLES[issue.status] || STATUS_STYLES.TODO}`}>
                        {issue.status?.replaceAll("_", " ") || "TODO"}
                      </span>
                    </td>

                    <td className="px-3 py-4 text-sm text-slate-500 dark:text-slate-400">
                      {formatDate(issue.due_date)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="py-12 text-center">
            <FaBug className="mx-auto text-3xl text-slate-300 dark:text-slate-600" />
            <p className="mt-3 text-sm font-medium text-slate-700 dark:text-slate-300">
              No issues in this project yet.
            </p>
            <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">
              Create an issue to start tracking work.
            </p>
          </div>
        )}
      </section>
    </div>
  );
}
