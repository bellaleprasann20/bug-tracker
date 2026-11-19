import React, { useEffect, useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import {
  FaArrowLeft,
  FaBug,
  FaEdit,
  FaTrash,
  FaSyncAlt,
  FaExclamationCircle,
} from "react-icons/fa";

import Loader from "../../components/common/Loader";
import Modal from "../../components/common/Modal";
import IssueForm from "../../components/issues/IssueForm";
import IssueComments from "../../components/issues/IssueComments";

import {
  getIssueById,
  updateIssue,
  deleteIssue,
} from "../../services/issueService";

import {
  getIssueComments,
  createComment as createIssueComment,
  updateComment as updateIssueComment,
  deleteComment as deleteIssueComment,
} from "../../services/commentService";

import { getProjects } from "../../services/projectService";
import { getProjectMembers } from "../../services/memberService";
import { useAuth } from "../../context/AuthContext";

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

export default function IssueDetails() {
  const { issueId } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();

  const [issue, setIssue] = useState(null);
  const [comments, setComments] = useState([]);
  const [projects, setProjects] = useState([]);
  const [members, setMembers] = useState([]);

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [showEditModal, setShowEditModal] = useState(false);

  const fetchIssue = async () => {
    setLoading(true);
    setError("");

    try {
      const issueData = await getIssueById(issueId);
      setIssue(issueData);

      const [commentResponse, projectResponse, memberResponse] =
        await Promise.all([
          getIssueComments(issueId),
          getProjects(),
          getProjectMembers(issueData.project_id),
        ]);

      const commentList = Array.isArray(commentResponse)
        ? commentResponse
        : commentResponse?.items || commentResponse?.comments || [];

      const projectList = Array.isArray(projectResponse)
        ? projectResponse
        : projectResponse?.items || projectResponse?.projects || [];

      const memberList = Array.isArray(memberResponse)
        ? memberResponse
        : memberResponse?.items || memberResponse?.members || [];

      setComments(commentList);
      setProjects(projectList);
      setMembers(memberList);
    } catch (err) {
      setError(
        err?.response?.data?.detail ||
          "Unable to load issue details."
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchIssue();
  }, [issueId]);

  const handleUpdate = async (payload) => {
    setSaving(true);
    setError("");

    try {
      const updatedIssue = await updateIssue(issueId, payload);
      setIssue(updatedIssue);
      setShowEditModal(false);
    } catch (err) {
      const detail = err?.response?.data?.detail;

      setError(
        typeof detail === "string"
          ? detail
          : "Unable to update issue."
      );
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async () => {
    const confirmed = window.confirm(
      "Are you sure you want to delete this issue? This action cannot be undone."
    );

    if (!confirmed) return;

    try {
      await deleteIssue(issueId);
      navigate("/issues", { replace: true });
    } catch (err) {
      setError(
        err?.response?.data?.detail ||
          "Unable to delete issue."
      );
    }
  };

  const handleAddComment = async (payload) => {
    const created = await createIssueComment(issueId, payload);

    setComments((previous) => [...previous, created]);

    return created;
  };

  const handleUpdateComment = async (commentId, payload) => {
    const updated = await updateIssueComment(commentId, payload);

    setComments((previous) =>
      previous.map((comment) =>
        comment.id === commentId ? updated : comment
      )
    );

    return updated;
  };

  const handleDeleteComment = async (commentId) => {
    await deleteIssueComment(commentId);

    setComments((previous) =>
      previous.filter((comment) => comment.id !== commentId)
    );
  };

  if (loading) {
    return <Loader fullscreen message="Loading issue..." />;
  }

  if (error && !issue) {
    return (
      <div className="rounded-xl border border-red-200 bg-red-50 p-6 dark:border-red-500/30 dark:bg-red-500/10">
        <div className="flex items-center gap-2 text-red-600 dark:text-red-400">
          <FaExclamationCircle />
          {error}
        </div>

        <button
          type="button"
          onClick={fetchIssue}
          className="mt-4 inline-flex items-center gap-2 text-sm font-semibold underline"
        >
          <FaSyncAlt />
          Retry
        </button>
      </div>
    );
  }

  if (!issue) return null;

  const canEdit =
    user?.role === "admin" ||
    issue.reporter_id === user?.id ||
    issue.assignee_id === user?.id;

  const canDelete =
    user?.role === "admin" ||
    issue.reporter_id === user?.id;

  return (
    <div className="space-y-6">
      <Link
        to="/issues"
        className="inline-flex items-center gap-2 text-sm font-medium text-slate-500 transition hover:text-indigo-600 dark:text-slate-400 dark:hover:text-indigo-400"
      >
        <FaArrowLeft />
        Back to Issues
      </Link>

      {error && (
        <div className="rounded-xl border border-red-200 bg-red-50 p-4 text-sm text-red-600 dark:border-red-500/30 dark:bg-red-500/10 dark:text-red-400">
          {error}
        </div>
      )}

      {/* Issue information */}
      <section className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm dark:border-slate-800 dark:bg-slate-900">
        <div className="flex flex-col gap-5 sm:flex-row sm:items-start sm:justify-between">
          <div className="flex min-w-0 items-start gap-4">
            <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-indigo-50 text-xl text-indigo-600 dark:bg-indigo-500/10 dark:text-indigo-400">
              <FaBug />
            </div>

            <div className="min-w-0">
              <p className="text-xs font-semibold text-indigo-600 dark:text-indigo-400">
                {issue.issue_key || "ISSUE"}
              </p>

              <h1 className="mt-1 text-2xl font-bold text-slate-900 dark:text-white">
                {issue.title}
              </h1>

              <p className="mt-2 text-sm text-slate-500 dark:text-slate-400">
                Project: {issue.project?.name || issue.project_name || issue.project_id}
              </p>
            </div>
          </div>

          <div className="flex flex-wrap gap-2">
            {canEdit && (
              <button
                type="button"
                onClick={() => setShowEditModal(true)}
                className="inline-flex items-center gap-2 rounded-xl border border-slate-200 px-4 py-2.5 text-sm font-semibold text-slate-700 hover:bg-slate-50 dark:border-slate-700 dark:text-slate-200 dark:hover:bg-slate-800"
              >
                <FaEdit />
                Edit
              </button>
            )}

            {canDelete && (
              <button
                type="button"
                onClick={handleDelete}
                className="inline-flex items-center gap-2 rounded-xl bg-red-600 px-4 py-2.5 text-sm font-semibold text-white hover:bg-red-700"
              >
                <FaTrash />
                Delete
              </button>
            )}
          </div>
        </div>

        <div className="mt-6 flex flex-wrap gap-3">
          <span className={`rounded-full px-3 py-1.5 text-xs font-semibold ${STATUS_STYLES[issue.status] || STATUS_STYLES.TODO}`}>
            {(issue.status || "TODO").replaceAll("_", " ")}
          </span>

          <span className={`rounded-full bg-slate-100 px-3 py-1.5 text-xs font-semibold dark:bg-slate-800 ${PRIORITY_STYLES[issue.priority] || PRIORITY_STYLES.LOW}`}>
            {issue.priority || "LOW"} PRIORITY
          </span>

          <span className="rounded-full bg-indigo-50 px-3 py-1.5 text-xs font-semibold text-indigo-700 dark:bg-indigo-500/10 dark:text-indigo-400">
            {issue.type || "BUG"}
          </span>
        </div>

        <div className="mt-7 border-t border-slate-100 pt-6 dark:border-slate-800">
          <h2 className="font-semibold text-slate-900 dark:text-white">
            Description
          </h2>

          <p className="mt-3 whitespace-pre-wrap text-sm leading-7 text-slate-600 dark:text-slate-300">
            {issue.description || "No description provided."}
          </p>
        </div>

        <div className="mt-7 grid grid-cols-1 gap-5 border-t border-slate-100 pt-6 dark:border-slate-800 sm:grid-cols-2 lg:grid-cols-4">
          <div>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              Assignee
            </p>

            <p className="mt-2 text-sm font-medium text-slate-800 dark:text-slate-200">
              {issue.assignee?.full_name || issue.assignee?.name || "Unassigned"}
            </p>
          </div>

          <div>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              Reporter
            </p>

            <p className="mt-2 text-sm font-medium text-slate-800 dark:text-slate-200">
              {issue.reporter?.full_name || issue.reporter?.name || "Unknown"}
            </p>
          </div>

          <div>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              Story Points
            </p>

            <p className="mt-2 text-sm font-medium text-slate-800 dark:text-slate-200">
              {issue.story_points ?? "Not estimated"}
            </p>
          </div>

          <div>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              Due Date
            </p>

            <p className="mt-2 text-sm font-medium text-slate-800 dark:text-slate-200">
              {issue.due_date
                ? new Date(issue.due_date).toLocaleDateString()
                : "Not specified"}
            </p>
          </div>
        </div>

        {issue.labels?.length > 0 && (
          <div className="mt-6 border-t border-slate-100 pt-6 dark:border-slate-800">
            <h2 className="text-sm font-semibold text-slate-900 dark:text-white">
              Labels
            </h2>

            <div className="mt-3 flex flex-wrap gap-2">
              {issue.labels.map((label) => (
                <span
                  key={label}
                  className="rounded-lg bg-slate-100 px-3 py-1.5 text-xs font-medium text-slate-600 dark:bg-slate-800 dark:text-slate-300"
                >
                  {label}
                </span>
              ))}
            </div>
          </div>
        )}
      </section>

      {/* Comments */}
      <section className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm dark:border-slate-800 dark:bg-slate-900">
        <IssueComments
          comments={comments}
          currentUser={user}
          onAddComment={handleAddComment}
          onEditComment={handleUpdateComment}
          onDeleteComment={handleDeleteComment}
        />
      </section>

      {/* Edit modal */}
      <Modal
        isOpen={showEditModal}
        onClose={() => {
          if (!saving) setShowEditModal(false);
        }}
        title="Edit Issue"
        size="lg"
      >
        <IssueForm
          initialData={issue}
          projects={projects}
          members={members}
          onSubmit={handleUpdate}
          onCancel={() => setShowEditModal(false)}
          loading={saving}
        />
      </Modal>
    </div>
  );
}
