
import React, { useState } from "react";
import {
  FaPaperPlane,
  FaReply,
  FaEdit,
  FaTrash,
  FaTimes,
  FaComments,
} from "react-icons/fa";
import Button from "../common/Button";

function getAuthorName(comment) {
  return (
    comment.author?.full_name ||
    comment.author_name ||
    comment.author?.name ||
    "Unknown user"
  );
}

function getInitials(name) {
  return name
    .split(" ")
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0].toUpperCase())
    .join("");
}

function formatCommentDate(value) {
  if (!value) return "";

  const date = new Date(value);

  if (Number.isNaN(date.getTime())) return "";

  return date.toLocaleString();
}

function CommentItem({
  comment,
  currentUser,
  onEdit,
  onDelete,
  onReply,
  depth = 0,
}) {
  const [editing, setEditing] = useState(false);
  const [editContent, setEditContent] = useState(
    comment.content || ""
  );

  const authorName = getAuthorName(comment);

  const isOwner =
    currentUser?.id &&
    (comment.author_id === currentUser.id ||
      comment.author?.id === currentUser.id);

  const isAdmin =
    currentUser?.role?.toLowerCase() === "admin";

  const canModify = isOwner || isAdmin;

  const saveEdit = async () => {
    if (!editContent.trim()) return;

    await onEdit?.(comment.id, editContent.trim());
    setEditing(false);
  };

  return (
    <div className="space-y-3">
      <div className="flex gap-3">
        <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-indigo-100 text-xs font-bold text-indigo-700 dark:bg-indigo-500/20 dark:text-indigo-300">
          {getInitials(authorName) || "U"}
        </div>

        <div className="min-w-0 flex-1">
          <div className="flex flex-wrap items-center gap-2">
            <span className="text-sm font-semibold text-slate-800 dark:text-white">
              {authorName}
            </span>

            <span className="text-xs text-slate-400">
              {formatCommentDate(comment.created_at)}
            </span>

            {comment.updated_at &&
              comment.created_at !== comment.updated_at && (
                <span className="text-xs text-slate-400">
                  (edited)
                </span>
              )}
          </div>

          {editing ? (
            <div className="mt-2 space-y-2">
              <textarea
                value={editContent}
                onChange={(event) =>
                  setEditContent(event.target.value)
                }
                rows={3}
                className="w-full rounded-lg border border-slate-300 bg-white p-3 text-sm text-slate-800 outline-none focus:border-indigo-500 dark:border-slate-700 dark:bg-slate-900 dark:text-white"
              />

              <div className="flex gap-2">
                <Button size="sm" onClick={saveEdit}>
                  Save
                </Button>

                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => {
                    setEditContent(comment.content || "");
                    setEditing(false);
                  }}
                >
                  Cancel
                </Button>
              </div>
            </div>
          ) : (
            <p className="mt-1 whitespace-pre-wrap break-words text-sm leading-6 text-slate-600 dark:text-slate-300">
              {comment.content}
            </p>
          )}

          {!editing && (
            <div className="mt-2 flex flex-wrap items-center gap-3">
              <button
                type="button"
                onClick={() => onReply?.(comment)}
                className="flex items-center gap-1 text-xs font-medium text-slate-500 hover:text-indigo-600 dark:text-slate-400 dark:hover:text-indigo-400"
              >
                <FaReply />
                Reply
              </button>

              {canModify && (
                <>
                  <button
                    type="button"
                    onClick={() => setEditing(true)}
                    className="flex items-center gap-1 text-xs font-medium text-slate-500 hover:text-indigo-600 dark:text-slate-400 dark:hover:text-indigo-400"
                  >
                    <FaEdit />
                    Edit
                  </button>

                  <button
                    type="button"
                    onClick={() => onDelete?.(comment.id)}
                    className="flex items-center gap-1 text-xs font-medium text-slate-500 hover:text-red-600 dark:text-slate-400"
                  >
                    <FaTrash />
                    Delete
                  </button>
                </>
              )}
            </div>
          )}
        </div>
      </div>

      {comment.replies?.length > 0 && (
        <div className="ml-4 space-y-4 border-l-2 border-slate-200 pl-4 dark:border-slate-800 sm:ml-6">
          {comment.replies.map((reply) => (
            <CommentItem
              key={reply.id}
              comment={reply}
              currentUser={currentUser}
              onEdit={onEdit}
              onDelete={onDelete}
              onReply={onReply}
              depth={depth + 1}
            />
          ))}
        </div>
      )}
    </div>
  );
}

export default function IssueComments({
  issueId,
  comments = [],
  currentUser,
  onAddComment,
  onEditComment,
  onDeleteComment,
}) {
  const [content, setContent] = useState("");
  const [replyTo, setReplyTo] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const topLevelComments = comments.filter(
    (comment) => !comment.parent_id
  );

  const handleSubmit = async (event) => {
    event.preventDefault();

    if (!content.trim()) {
      setError("Please enter a comment.");
      return;
    }

    setLoading(true);
    setError("");

    try {
      await onAddComment?.({
        issue_id: issueId,
        content: content.trim(),
        parent_id: replyTo?.id || null,
      });

      setContent("");
      setReplyTo(null);
    } catch (err) {
      setError(
        err?.response?.data?.detail ||
        err?.message ||
        "Unable to add comment."
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <section className="space-y-5 rounded-xl border border-slate-200 bg-white p-5 dark:border-slate-800 dark:bg-slate-900">
      <div className="flex items-center gap-2">
        <FaComments className="text-indigo-600 dark:text-indigo-400" />

        <h3 className="text-base font-semibold text-slate-900 dark:text-white">
          Comments
        </h3>

        <span className="rounded-full bg-slate-100 px-2 py-0.5 text-xs font-medium text-slate-600 dark:bg-slate-800 dark:text-slate-300">
          {comments.length}
        </span>
      </div>

      <form onSubmit={handleSubmit} className="space-y-3">
        {replyTo && (
          <div className="flex items-center justify-between rounded-lg bg-indigo-50 px-3 py-2 text-xs text-indigo-700 dark:bg-indigo-500/10 dark:text-indigo-300">
            <span>
              Replying to {getAuthorName(replyTo)}
            </span>

            <button
              type="button"
              onClick={() => setReplyTo(null)}
              aria-label="Cancel reply"
            >
              <FaTimes />
            </button>
          </div>
        )}

        <textarea
          value={content}
          onChange={(event) => setContent(event.target.value)}
          rows={3}
          placeholder={
            replyTo
              ? "Write your reply..."
              : "Write a comment..."
          }
          className="w-full resize-y rounded-lg border border-slate-300 bg-white px-3 py-2.5 text-sm text-slate-800 outline-none transition focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100 dark:border-slate-700 dark:bg-slate-950 dark:text-white dark:focus:ring-indigo-900/40"
        />

        {error && (
          <p role="alert" className="text-xs text-red-500">
            {error}
          </p>
        )}

        <div className="flex justify-end">
          <Button
            type="submit"
            loading={loading}
            disabled={!content.trim()}
            leftIcon={<FaPaperPlane />}
          >
            {replyTo ? "Send Reply" : "Add Comment"}
          </Button>
        </div>
      </form>

      <div className="border-t border-slate-200 pt-5 dark:border-slate-800">
        {topLevelComments.length === 0 ? (
          <p className="py-5 text-center text-sm text-slate-500 dark:text-slate-400">
            No comments yet. Start the conversation.
          </p>
        ) : (
          <div className="space-y-5">
            {topLevelComments.map((comment) => (
              <CommentItem
                key={comment.id}
                comment={comment}
                currentUser={currentUser}
                onEdit={onEditComment}
                onDelete={onDeleteComment}
                onReply={setReplyTo}
              />
            ))}
          </div>
        )}
      </div>
    </section>
  );
}
