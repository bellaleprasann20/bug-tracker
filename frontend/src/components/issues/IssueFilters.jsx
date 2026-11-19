
import React from "react";
import { FaFilter, FaTimes } from "react-icons/fa";
import Dropdown from "../common/Dropdown";
import SearchBar from "../common/SearchBar";
import Button from "../common/Button";

const statusOptions = [
  { label: "To Do", value: "TODO" },
  { label: "In Progress", value: "IN_PROGRESS" },
  { label: "In Review", value: "IN_REVIEW" },
  { label: "Done", value: "DONE" },
];

const priorityOptions = [
  { label: "Low", value: "LOW" },
  { label: "Medium", value: "MEDIUM" },
  { label: "High", value: "HIGH" },
  { label: "Critical", value: "CRITICAL" },
];

const typeOptions = [
  { label: "Bug", value: "BUG" },
  { label: "Task", value: "TASK" },
  { label: "Feature", value: "FEATURE" },
];

export default function IssueFilters({
  filters = {},
  onFilterChange,
  members = [],
  onReset,
}) {
  const updateFilter = (event) => {
    const { name, value } = event.target;

    onFilterChange?.({
      ...filters,
      [name]: value,
    });
  };

  const hasActiveFilters = Object.values(filters).some(
    (value) => value !== "" && value !== null && value !== undefined
  );

  return (
    <div className="space-y-4 rounded-xl border border-slate-200 bg-white p-4 dark:border-slate-800 dark:bg-slate-900">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-2">
          <FaFilter className="text-indigo-600 dark:text-indigo-400" />

          <h3 className="text-sm font-semibold text-slate-800 dark:text-white">
            Filter Issues
          </h3>
        </div>

        {hasActiveFilters && (
          <Button
            variant="ghost"
            size="sm"
            onClick={onReset}
            leftIcon={<FaTimes />}
          >
            Clear filters
          </Button>
        )}
      </div>

      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 xl:grid-cols-4">
        <div className="sm:col-span-2 xl:col-span-1">
          <SearchBar
            value={filters.search || ""}
            onChange={(event) =>
              onFilterChange?.({
                ...filters,
                search: event.target.value,
              })
            }
            placeholder="Search issues..."
          />
        </div>

        <Dropdown
          name="status"
          value={filters.status || ""}
          onChange={updateFilter}
          placeholder="All statuses"
          options={statusOptions}
        />

        <Dropdown
          name="priority"
          value={filters.priority || ""}
          onChange={updateFilter}
          placeholder="All priorities"
          options={priorityOptions}
        />

        <Dropdown
          name="type"
          value={filters.type || ""}
          onChange={updateFilter}
          placeholder="All types"
          options={typeOptions}
        />

        <Dropdown
          name="assignee_id"
          value={filters.assignee_id || ""}
          onChange={updateFilter}
          placeholder="All assignees"
          options={members.map((member) => ({
            label:
              member.full_name ||
              member.name ||
              member.email,
            value: member.id,
          }))}
        />
      </div>
    </div>
  );
}
