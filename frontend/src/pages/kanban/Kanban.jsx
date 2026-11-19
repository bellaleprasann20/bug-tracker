
import React, { useCallback, useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import {
  DndContext,
  DragOverlay,
  PointerSensor,
  useSensor,
  useSensors,
  closestCorners,
} from "@dnd-kit/core";
import {
  FaPlus,
  FaSyncAlt,
  FaExclamationCircle,
  FaColumns,
} from "react-icons/fa";

import KanbanBoard from "../../components/kanban/KanbanBoard";
import IssueCard from "../../components/kanban/IssueCard";
import Loader from "../../components/common/Loader";
import {
  getIssues,
  updateIssue,
} from "../../services/issueService";

const COLUMNS = [
  { id: "TODO", title: "To Do", color: "bg-slate-400" },
  { id: "IN_PROGRESS", title: "In Progress", color: "bg-blue-500" },
  { id: "IN_REVIEW", title: "In Review", color: "bg-orange-500" },
  { id: "DONE", title: "Done", color: "bg-emerald-500" },
];

export default function Kanban() {
  const [issues, setIssues] = useState([]);
  const [activeIssue, setActiveIssue] = useState(null);
  const [loading, setLoading] = useState(true);
  const [updating, setUpdating] = useState(false);
  const [error, setError] = useState("");

  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 6,
      },
    })
  );

  const fetchBoard = useCallback(async () => {
    setLoading(true);
    setError("");

    try {
      const response = await getIssues({ page_size: 100 });

      const issueList = Array.isArray(response)
        ? response
        : response?.items || response?.issues || [];

      setIssues(issueList);
    } catch (err) {
      setError(
        err?.response?.data?.detail ||
          "Unable to load Kanban board."
      );
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchBoard();
  }, [fetchBoard]);

  const groupedIssues = useMemo(() => {
    return COLUMNS.reduce((groups, column) => {
      groups[column.id] = issues.filter(
        (issue) => (issue.status || "TODO") === column.id
      );

      return groups;
    }, {});
  }, [issues]);

  const handleDragStart = ({ active }) => {
    const selectedIssue = issues.find(
      (issue) => issue.id === active.id
    );

    setActiveIssue(selectedIssue || null);
  };

  const handleDragCancel = () => {
    setActiveIssue(null);
  };

  const handleDragEnd = async ({ active, over }) => {
    setActiveIssue(null);

    if (!over) return;

    const issueId = active.id;
    const issue = issues.find((item) => item.id === issueId);

    if (!issue) return;

    const targetId = String(over.id);

    let newStatus = null;

    if (COLUMNS.some((column) => column.id === targetId)) {
      newStatus = targetId;
    } else {
      const targetIssue = issues.find(
        (item) => item.id === targetId
      );

      if (targetIssue) {
        newStatus = targetIssue.status || "TODO";
      }
    }

    if (!newStatus || newStatus === issue.status) return;

    const previousIssues = issues;

    setIssues((current) =>
      current.map((item) =>
        item.id === issueId
          ? { ...item, status: newStatus }
          : item
      )
    );

    setUpdating(true);
    setError("");

    try {
      await updateIssue(issueId, {
        status: newStatus,
      });
    } catch (err) {
      setIssues(previousIssues);

      setError(
        err?.response?.data?.detail ||
          "Unable to update issue status."
      );
    } finally {
      setUpdating(false);
    }
  };

  if (loading) {
    return <Loader fullscreen message="Loading Kanban board..." />;
  }

  return (
    <div className="space-y-7">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <p className="text-sm font-semibold text-indigo-600 dark:text-indigo-400">
            VISUAL WORKFLOW
          </p>

          <h1 className="mt-1 text-3xl font-bold text-slate-900 dark:text-white">
            Kanban Board
          </h1>

          <p className="mt-2 text-sm text-slate-500 dark:text-slate-400">
            Organize issues and track progress across your workflow.
          </p>
        </div>

        <div className="flex flex-wrap gap-2">
          <button
            type="button"
            onClick={fetchBoard}
            disabled={updating}
            className="inline-flex items-center gap-2 rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm font-medium text-slate-700 hover:bg-slate-50 disabled:opacity-50 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-200"
          >
            <FaSyncAlt />
            Refresh
          </button>

          <Link
            to="/issues/create"
            className="inline-flex items-center gap-2 rounded-xl bg-indigo-600 px-4 py-3 text-sm font-semibold text-white hover:bg-indigo-700"
          >
            <FaPlus />
            Create Issue
          </Link>
        </div>
      </div>

      {error && (
        <div
          role="alert"
          className="flex items-center gap-3 rounded-xl border border-red-200 bg-red-50 p-4 text-sm text-red-600 dark:border-red-500/30 dark:bg-red-500/10 dark:text-red-400"
        >
          <FaExclamationCircle />
          {error}
        </div>
      )}

      <div className="flex flex-wrap items-center justify-between gap-3 rounded-xl border border-slate-200 bg-white px-5 py-4 dark:border-slate-800 dark:bg-slate-900">
        <div className="flex items-center gap-3">
          <FaColumns className="text-indigo-600 dark:text-indigo-400" />

          <span className="text-sm font-semibold text-slate-800 dark:text-slate-200">
            Project workflow
          </span>
        </div>

        <div className="flex items-center gap-4 text-xs text-slate-500 dark:text-slate-400">
          <span>{issues.length} total issues</span>

          {updating && (
            <span className="font-medium text-indigo-600 dark:text-indigo-400">
              Saving changes...
            </span>
          )}
        </div>
      </div>

      {issues.length === 0 ? (
        <div className="rounded-2xl border border-dashed border-slate-300 bg-white py-16 text-center dark:border-slate-700 dark:bg-slate-900">
          <FaColumns className="mx-auto text-4xl text-slate-300 dark:text-slate-600" />

          <h3 className="mt-4 font-semibold text-slate-800 dark:text-white">
            No issues to display
          </h3>

          <p className="mt-2 text-sm text-slate-500 dark:text-slate-400">
            Create your first issue to populate the Kanban board.
          </p>

          <Link
            to="/issues/create"
            className="mt-5 inline-flex items-center gap-2 rounded-xl bg-indigo-600 px-4 py-2.5 text-sm font-semibold text-white hover:bg-indigo-700"
          >
            <FaPlus />
            Create Issue
          </Link>
        </div>
      ) : (
        <DndContext
          sensors={sensors}
          collisionDetection={closestCorners}
          onDragStart={handleDragStart}
          onDragCancel={handleDragCancel}
          onDragEnd={handleDragEnd}
        >
          <KanbanBoard
            columns={COLUMNS}
            issues={groupedIssues}
          />

          <DragOverlay>
            {activeIssue ? (
              <div className="rotate-2 opacity-90">
                <IssueCard issue={activeIssue} />
              </div>
            ) : null}
          </DragOverlay>
        </DndContext>
      )}
    </div>
  );
}
