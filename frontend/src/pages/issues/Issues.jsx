
import React, { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import {
  FaPlus,
  FaBug,
  FaSyncAlt,
  FaExclamationCircle,
} from "react-icons/fa";

import IssueFilters from "../../components/issues/IssueFilters";
import Loader from "../../components/common/Loader";
import Pagination from "../../components/common/Pagination";
import { getIssues } from "../../services/issueService";

const PRIORITY_STYLES = {
  LOW: "bg-slate-100 text-slate-600 dark:bg-slate-700 dark:text-slate-300",
  MEDIUM: "bg-blue-100 text-blue-700 dark:bg-blue-500/10 dark:text-blue-400",
  HIGH: "bg-orange-100 text-orange-700 dark:bg-orange-500/10 dark:text-orange-400",
  CRITICAL: "bg-red-100 text-red-700 dark:bg-red-500/10 dark:text-red-400",
};

const STATUS_STYLES = {
  TODO: "bg-slate-100 text-slate-700 dark:bg-slate-700 dark:text-slate-300",
  IN_PROGRESS: "bg-blue-100 text-blue-700 dark:bg-blue-500/10 dark:text-blue-400",
  IN_REVIEW: "bg-orange-100 text-orange-700 dark:bg-orange-500/10 dark:text-orange-400",
  DONE: "bg-emerald-100 text-emerald-700 dark:bg-emerald-500/10 dark:text-emerald-400",
};

function IssueRow({ issue }) {
  return (
    <tr className="border-b border-slate-100 transition hover:bg-slate-50 dark:border-slate-800 dark:hover:bg-slate-800/40">
      <td className="px-4 py-4">
        <div className="flex items-start gap-3">
          <div className="mt-1 flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-indigo-50 text-indigo-600 dark:bg-indigo-500/10 dark:text-indigo-400">
            <FaBug />
          </div>

          <div className="min-w-0">
            <Link
              to={`/issues/${issue.id}`}
              className="font-semibold text-slate-800 hover:text-indigo-600 dark:text-slate-100 dark:hover:text-indigo-400"
            >
              {issue.title}
            </Link>

            <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">
              {issue.issue_key || "Issue"} · {issue.project?.name || "Project"}
            </p>
          </div>
        </div>
      </td>

      <td className="px-4 py-4">
        <span className="rounded-full bg-slate-100 px-3 py-1 text-xs font-medium text-slate-600 dark:bg-slate-800 dark:text-slate-300">
          {issue.type || "BUG"}
        </span>
      </td>

      <td className="px-4 py-4">
        <span className={`rounded-full px-3 py-1 text-xs font-medium ${PRIORITY_STYLES[issue.priority] || PRIORITY_STYLES.LOW}`}>
          {issue.priority || "LOW"}
        </span>
      </td>

      <td className="px-4 py-4">
        <span className={`rounded-full px-3 py-1 text-xs font-medium ${STATUS_STYLES[issue.status] || STATUS_STYLES.TODO}`}>
          {(issue.status || "TODO").replaceAll("_", " ")}
        </span>
      </td>

      <td className="px-4 py-4 text-sm text-slate-600 dark:text-slate-300">
        {issue.assignee?.full_name || issue.assignee?.name || "Unassigned"}
      </td>

      <td className="px-4 py-4 text-sm text-slate-500 dark:text-slate-400">
        {issue.due_date
          ? new Date(issue.due_date).toLocaleDateString()
          : "—"}
      </td>
    </tr>
  );
}

export default function Issues() {
  const [issues, setIssues] = useState([]);
  const [filters, setFilters] = useState({
    search: "",
    status: "",
    priority: "",
    type: "",
    assignee_id: "",
  });

  const [page, setPage] = useState(1);
  const [pageSize] = useState(10);
  const [totalItems, setTotalItems] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const fetchIssues = async () => {
    setLoading(true);
    setError("");

    try {
      const params = {
        ...filters,
        page,
        page_size: pageSize,
      };

      Object.keys(params).forEach((key) => {
        if (params[key] === "") delete params[key];
      });

      const response = await getIssues(params);

      const issueList = Array.isArray(response)
        ? response
        : response?.items || response?.issues || [];

      setIssues(issueList);
      setTotalItems(
        response?.total ?? response?.total_items ?? issueList.length
      );
    } catch (err) {
      setError(
        err?.response?.data?.detail ||
          "Unable to load issues."
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchIssues();
  }, [page, filters]);

  const handleFilterChange = (nextFilters) => {
    setFilters(nextFilters);
    setPage(1);
  };

  const handleReset = () => {
    setFilters({
      search: "",
      status: "",
      priority: "",
      type: "",
      assignee_id: "",
    });
    setPage(1);
  };

  const totalPages = Math.max(1, Math.ceil(totalItems / pageSize));

  return (
    <div className="space-y-7">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <p className="text-sm font-semibold text-indigo-600 dark:text-indigo-400">
            ISSUE MANAGEMENT
          </p>

          <h1 className="mt-1 text-3xl font-bold text-slate-900 dark:text-white">
            Issues
          </h1>

          <p className="mt-2 text-sm text-slate-500 dark:text-slate-400">
            Track bugs, tasks, and feature requests across projects.
          </p>
        </div>

        <div className="flex gap-2">
          <button
            type="button"
            onClick={fetchIssues}
            className="inline-flex items-center justify-center gap-2 rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm font-medium text-slate-700 hover:bg-slate-50 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-200"
          >
            <FaSyncAlt />
            Refresh
          </button>

          <Link
            to="/issues/create"
            className="inline-flex items-center justify-center gap-2 rounded-xl bg-indigo-600 px-4 py-3 text-sm font-semibold text-white transition hover:bg-indigo-700"
          >
            <FaPlus />
            Create Issue
          </Link>
        </div>
      </div>

      <IssueFilters
        filters={filters}
        onFilterChange={handleFilterChange}
        onReset={handleReset}
      />

      {error && (
        <div className="flex items-center justify-between gap-3 rounded-xl border border-red-200 bg-red-50 p-4 text-sm text-red-600 dark:border-red-500/30 dark:bg-red-500/10 dark:text-red-400">
          <span className="flex items-center gap-2">
            <FaExclamationCircle />
            {error}
          </span>

          <button
            type="button"
            onClick={fetchIssues}
            className="font-semibold underline"
          >
            Retry
          </button>
        </div>
      )}

      <div className="rounded-2xl border border-slate-200 bg-white shadow-sm dark:border-slate-800 dark:bg-slate-900">
        <div className="flex items-center justify-between border-b border-slate-100 px-5 py-4 dark:border-slate-800">
          <h2 className="font-semibold text-slate-900 dark:text-white">
            All Issues
          </h2>

          <span className="text-xs text-slate-500 dark:text-slate-400">
            {totalItems} total
          </span>
        </div>

        {loading ? (
          <div className="py-16">
            <Loader message="Loading issues..." />
          </div>
        ) : issues.length > 0 ? (
          <>
            <div className="overflow-x-auto">
              <table className="w-full min-w-[850px] text-left">
                <thead>
                  <tr className="border-b border-slate-100 bg-slate-50 text-xs uppercase tracking-wider text-slate-500 dark:border-slate-800 dark:bg-slate-800/50 dark:text-slate-400">
                    <th className="px-4 py-4 font-semibold">Issue</th>
                    <th className="px-4 py-4 font-semibold">Type</th>
                    <th className="px-4 py-4 font-semibold">Priority</th>
                    <th className="px-4 py-4 font-semibold">Status</th>
                    <th className="px-4 py-4 font-semibold">Assignee</th>
                    <th className="px-4 py-4 font-semibold">Due Date</th>
                  </tr>
                </thead>

                <tbody>
                  {issues.map((issue) => (
                    <IssueRow key={issue.id} issue={issue} />
                  ))}
                </tbody>
              </table>
            </div>

            <div className="border-t border-slate-100 p-4 dark:border-slate-800">
              <Pagination
                currentPage={page}
                totalPages={totalPages}
                totalItems={totalItems}
                pageSize={pageSize}
                onPageChange={setPage}
              />
            </div>
          </>
        ) : (
          <div className="py-16 text-center">
            <FaBug className="mx-auto text-4xl text-slate-300 dark:text-slate-600" />

            <h3 className="mt-4 font-semibold text-slate-800 dark:text-white">
              No issues found
            </h3>

            <p className="mt-2 text-sm text-slate-500 dark:text-slate-400">
              Create an issue or change your filters.
            </p>

            <Link
              to="/issues/create"
              className="mt-5 inline-flex items-center gap-2 rounded-xl bg-indigo-600 px-4 py-2.5 text-sm font-semibold text-white hover:bg-indigo-700"
            >
              <FaPlus />
              Create Issue
            </Link>
          </div>
        )}
      </div>
    </div>
  );
}
