
import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import {
  FaFolder,
  FaBug,
  FaClock,
  FaCheckCircle,
  FaArrowRight,
  FaPlus,
  FaTasks,
  FaExclamationCircle,
  FaChartPie,
  FaSyncAlt,
} from "react-icons/fa";
import {
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  Tooltip,
} from "recharts";

import Loader from "../../components/common/Loader";
import { useAuth } from "../../context/AuthContext";
import { getDashboardStats } from "../../services/dashboardService";

const STATUS_COLORS = {
  TODO: "#94a3b8",
  IN_PROGRESS: "#6366f1",
  IN_REVIEW: "#f59e0b",
  DONE: "#10b981",
};

const STATUS_LABELS = {
  TODO: "To Do",
  IN_PROGRESS: "In Progress",
  IN_REVIEW: "In Review",
  DONE: "Done",
};

const PRIORITY_COLORS = {
  LOW: "bg-slate-100 text-slate-600 dark:bg-slate-700 dark:text-slate-300",
  MEDIUM: "bg-blue-100 text-blue-700 dark:bg-blue-500/10 dark:text-blue-400",
  HIGH: "bg-orange-100 text-orange-700 dark:bg-orange-500/10 dark:text-orange-400",
  CRITICAL: "bg-red-100 text-red-700 dark:bg-red-500/10 dark:text-red-400",
};

function StatCard({ title, value, icon, description, iconClass }) {
  return (
    <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm transition hover:-translate-y-1 hover:shadow-md dark:border-slate-800 dark:bg-slate-900">
      <div className="flex items-start justify-between">
        <div>
          <p className="text-sm font-medium text-slate-500 dark:text-slate-400">
            {title}
          </p>

          <h3 className="mt-3 text-3xl font-bold text-slate-900 dark:text-white">
            {value ?? 0}
          </h3>

          <p className="mt-2 text-xs text-slate-500 dark:text-slate-400">
            {description}
          </p>
        </div>

        <div className={`flex h-12 w-12 items-center justify-center rounded-xl text-lg ${iconClass}`}>
          {icon}
        </div>
      </div>
    </div>
  );
}

function RecentIssueRow({ issue }) {
  const status = issue.status || "TODO";
  const priority = issue.priority || "LOW";

  return (
    <Link
      to={`/issues/${issue.id}`}
      className="flex flex-col gap-3 rounded-xl border border-slate-100 p-4 transition hover:border-indigo-200 hover:bg-indigo-50/40 dark:border-slate-800 dark:hover:border-indigo-500/30 dark:hover:bg-indigo-500/5 sm:flex-row sm:items-center sm:justify-between"
    >
      <div className="flex min-w-0 items-start gap-3">
        <div className="mt-1 flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-indigo-50 text-indigo-600 dark:bg-indigo-500/10 dark:text-indigo-400">
          <FaBug />
        </div>

        <div className="min-w-0">
          <p className="truncate text-sm font-semibold text-slate-800 dark:text-slate-100">
            {issue.title}
          </p>

          <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">
            {issue.issue_key || "Issue"} ·{" "}
            {issue.project?.name || issue.project_name || "Project"}
          </p>
        </div>
      </div>

      <div className="flex flex-wrap items-center gap-2 sm:shrink-0">
        <span
          className={`rounded-full px-3 py-1 text-xs font-medium ${PRIORITY_COLORS[priority] || PRIORITY_COLORS.LOW}`}
        >
          {priority}
        </span>

        <span className="rounded-full bg-slate-100 px-3 py-1 text-xs font-medium text-slate-600 dark:bg-slate-800 dark:text-slate-300">
          {STATUS_LABELS[status] || status}
        </span>

        <FaArrowRight className="hidden text-xs text-slate-400 sm:block" />
      </div>
    </Link>
  );
}

function EmptyState({ message }) {
  return (
    <div className="flex flex-col items-center justify-center py-12 text-center">
      <div className="flex h-14 w-14 items-center justify-center rounded-full bg-slate-100 text-xl text-slate-400 dark:bg-slate-800">
        <FaTasks />
      </div>

      <p className="mt-4 text-sm font-medium text-slate-700 dark:text-slate-300">
        {message}
      </p>

      <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">
        Your latest activity will appear here.
      </p>
    </div>
  );
}

export default function Dashboard() {
  const { user } = useAuth();

  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const fetchDashboard = async () => {
    setLoading(true);
    setError("");

    try {
      const response = await getDashboardStats();
      setStats(response);
    } catch (err) {
      setError(
        err?.response?.data?.detail ||
          "Unable to load dashboard information."
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDashboard();
  }, []);

  const userName =
    user?.full_name || user?.name || user?.email?.split("@")[0] || "User";

  if (loading) {
    return <Loader fullscreen message="Loading dashboard..." />;
  }

  if (error) {
    return (
      <div className="rounded-2xl border border-red-200 bg-red-50 p-6 dark:border-red-500/30 dark:bg-red-500/10">
        <div className="flex items-center gap-3 text-red-600 dark:text-red-400">
          <FaExclamationCircle className="text-xl" />

          <p className="text-sm font-medium">{error}</p>
        </div>

        <button
          type="button"
          onClick={fetchDashboard}
          className="mt-4 inline-flex items-center gap-2 rounded-lg bg-red-600 px-4 py-2 text-sm font-medium text-white transition hover:bg-red-700"
        >
          <FaSyncAlt />
          Try Again
        </button>
      </div>
    );
  }

  const overview = stats?.overview || stats?.statistics || stats || {};

  const totalProjects =
    overview.total_projects ?? overview.project_count ?? 0;

  const totalIssues =
    overview.total_issues ?? overview.issue_count ?? 0;

  const openIssues =
    overview.open_issues ??
    overview.in_progress_issues ??
    0;

  const completedIssues =
    overview.completed_issues ??
    overview.done_issues ??
    0;

  const recentIssues =
    stats?.recent_issues ??
    stats?.recentIssues ??
    stats?.issues ??
    [];

  const statusCounts =
    stats?.issue_status_counts ??
    stats?.status_distribution ??
    stats?.status_counts ??
    {};

  const chartData = Object.entries(statusCounts)
    .map(([status, count]) => ({
      name: STATUS_LABELS[status] || status,
      value: Number(count) || 0,
      color: STATUS_COLORS[status] || "#94a3b8",
    }))
    .filter((item) => item.value > 0);

  return (
    <div className="space-y-7">
      {/* Welcome section */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <p className="text-sm font-medium text-indigo-600 dark:text-indigo-400">
            OVERVIEW
          </p>

          <h1 className="mt-1 text-2xl font-bold text-slate-900 dark:text-white sm:text-3xl">
            Welcome back, {userName}!
          </h1>

          <p className="mt-2 text-sm text-slate-500 dark:text-slate-400">
            Here's what's happening across your workspace.
          </p>
        </div>

        <button
          type="button"
          onClick={fetchDashboard}
          className="inline-flex items-center justify-center gap-2 self-start rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-sm font-medium text-slate-700 transition hover:bg-slate-50 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-200 dark:hover:bg-slate-800 sm:self-auto"
        >
          <FaSyncAlt />
          Refresh
        </button>
      </div>

      {/* Quick actions */}
      <div className="flex flex-wrap gap-3">
        <Link
          to="/projects"
          className="inline-flex items-center gap-2 rounded-xl bg-indigo-600 px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-indigo-700"
        >
          <FaPlus />
          View Projects
        </Link>

        <Link
          to="/issues"
          className="inline-flex items-center gap-2 rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-sm font-semibold text-slate-700 transition hover:bg-slate-50 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-200 dark:hover:bg-slate-800"
        >
          <FaTasks />
          Browse Issues
        </Link>
      </div>

      {/* Statistics */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <StatCard
          title="Total Projects"
          value={totalProjects}
          description="Projects you can access"
          icon={<FaFolder />}
          iconClass="bg-indigo-50 text-indigo-600 dark:bg-indigo-500/10 dark:text-indigo-400"
        />

        <StatCard
          title="Total Issues"
          value={totalIssues}
          description="Issues across your projects"
          icon={<FaBug />}
          iconClass="bg-blue-50 text-blue-600 dark:bg-blue-500/10 dark:text-blue-400"
        />

        <StatCard
          title="Open Issues"
          value={openIssues}
          description="Issues requiring attention"
          icon={<FaClock />}
          iconClass="bg-orange-50 text-orange-600 dark:bg-orange-500/10 dark:text-orange-400"
        />

        <StatCard
          title="Completed Issues"
          value={completedIssues}
          description="Successfully completed"
          icon={<FaCheckCircle />}
          iconClass="bg-emerald-50 text-emerald-600 dark:bg-emerald-500/10 dark:text-emerald-400"
        />
      </div>

      {/* Charts and recent issues */}
      <div className="grid grid-cols-1 gap-6 xl:grid-cols-3">
        {/* Status chart */}
        <section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm dark:border-slate-800 dark:bg-slate-900">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-indigo-50 text-indigo-600 dark:bg-indigo-500/10 dark:text-indigo-400">
              <FaChartPie />
            </div>

            <div>
              <h2 className="font-semibold text-slate-900 dark:text-white">
                Issue Status
              </h2>

              <p className="text-xs text-slate-500 dark:text-slate-400">
                Distribution by status
              </p>
            </div>
          </div>

          {chartData.length > 0 ? (
            <>
              <div className="mt-4 h-56">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={chartData}
                      dataKey="value"
                      nameKey="name"
                      cx="50%"
                      cy="50%"
                      innerRadius={55}
                      outerRadius={85}
                      paddingAngle={4}
                    >
                      {chartData.map((entry) => (
                        <Cell
                          key={entry.name}
                          fill={entry.color}
                        />
                      ))}
                    </Pie>

                    <Tooltip />
                  </PieChart>
                </ResponsiveContainer>
              </div>

              <div className="space-y-3">
                {chartData.map((item) => (
                  <div
                    key={item.name}
                    className="flex items-center justify-between text-sm"
                  >
                    <div className="flex items-center gap-2">
                      <span
                        className="h-2.5 w-2.5 rounded-full"
                        style={{ backgroundColor: item.color }}
                      />

                      <span className="text-slate-600 dark:text-slate-300">
                        {item.name}
                      </span>
                    </div>

                    <span className="font-semibold text-slate-800 dark:text-slate-100">
                      {item.value}
                    </span>
                  </div>
                ))}
              </div>
            </>
          ) : (
            <EmptyState message="No issue status data available" />
          )}
        </section>

        {/* Recent issues */}
        <section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm dark:border-slate-800 dark:bg-slate-900 xl:col-span-2">
          <div className="mb-5 flex items-center justify-between">
            <div>
              <h2 className="font-semibold text-slate-900 dark:text-white">
                Recent Issues
              </h2>

              <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">
                Recently created or updated issues
              </p>
            </div>

            <Link
              to="/issues"
              className="inline-flex items-center gap-2 text-sm font-semibold text-indigo-600 hover:text-indigo-700 dark:text-indigo-400"
            >
              View all
              <FaArrowRight className="text-xs" />
            </Link>
          </div>

          {recentIssues.length > 0 ? (
            <div className="space-y-3">
              {recentIssues.slice(0, 6).map((issue) => (
                <RecentIssueRow
                  key={issue.id}
                  issue={issue}
                />
              ))}
            </div>
          ) : (
            <EmptyState message="No recent issues found" />
          )}
        </section>
      </div>
    </div>
  );
}
