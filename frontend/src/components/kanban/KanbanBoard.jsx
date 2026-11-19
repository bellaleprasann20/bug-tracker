
import React from "react";
import { DndContext, closestCorners } from "@dnd-kit/core";
import {
  SortableContext,
  verticalListSortingStrategy,
} from "@dnd-kit/sortable";
import KanbanColumn from "./KanbanColumn";

const columns = [
  { id: "TODO", title: "To Do" },
  { id: "IN_PROGRESS", title: "In Progress" },
  { id: "IN_REVIEW", title: "In Review" },
  { id: "DONE", title: "Done" },
];

export default function KanbanBoard({
  issues = [],
  onIssueClick,
  onAddIssue,
  onDragEnd,
}) {
  const getIssuesByStatus = (status) =>
    issues.filter((issue) => issue.status === status);

  return (
    <DndContext
      collisionDetection={closestCorners}
      onDragEnd={onDragEnd}
    >
      <div className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-4">
        {columns.map((column) => {
          const columnIssues = getIssuesByStatus(column.id);

          return (
            <KanbanColumn
              key={column.id}
              status={column.id}
              title={column.title}
              issues={columnIssues}
              onIssueClick={onIssueClick}
              onAddIssue={onAddIssue}
            />
          );
        })}
      </div>
    </DndContext>
  );
}
