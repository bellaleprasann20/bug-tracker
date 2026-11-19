import React, { useEffect, useState } from "react";
import Button from "../common/Button";
import Input from "../common/Input";
import Dropdown from "../common/Dropdown";

const initialForm = {
  title: "",
  description: "",
  type: "BUG",
  priority: "medium",
  project_id: "",
  assignee_id: "",
  story_points: "",
  labels: [],
  due_date: "",
};

const typeOptions = [
  { label: "Bug", value: "BUG" },
  { label: "Task", value: "TASK" },
  { label: "Feature", value: "FEATURE" },
];

const priorityOptions = [
  { label: "Low", value: "low" },
  { label: "Medium", value: "medium" },
  { label: "High", value: "high" },
  { label: "Critical", value: "critical" },
];

export default function IssueForm({
  initialData = null,
  projects = [],
  members = [],
  onSubmit,
  onCancel,
  loading = false,
}) {
  const [form, setForm] = useState(initialForm);
  const [labelInput, setLabelInput] = useState("");
  const [error, setError] = useState("");

  const isEditing = Boolean(initialData?.id);

  useEffect(() => {
    if (!initialData) {
      setForm(initialForm);
      return;
    }

    setForm({
      title: initialData.title || "",
      description: initialData.description || "",
      type: initialData.type || "BUG",
      priority: String(initialData.priority || "medium").toLowerCase(),
      project_id: initialData.project_id || "",
      assignee_id: initialData.assignee_id || "",
      story_points: initialData.story_points ?? "",
      labels: initialData.labels || [],
      due_date: initialData.due_date
        ? initialData.due_date.slice(0, 10)
        : "",
    });
  }, [initialData]);

  const updateField = (event) => {
    const { name, value } = event.target;

    setForm((previous) => ({
      ...previous,
      [name]: value,
    }));
  };

  const addLabel = () => {
    const label = labelInput.trim();

    if (!label || form.labels.includes(label)) return;

    setForm((previous) => ({
      ...previous,
      labels: [...previous.labels, label],
    }));

    setLabelInput("");
  };

  const removeLabel = (labelToRemove) => {
    setForm((previous) => ({
      ...previous,
      labels: previous.labels.filter(
        (label) => label !== labelToRemove
      ),
    }));
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    setError("");

    if (!form.title.trim()) {
      setError("Please enter an issue title.");
      return;
    }

    if (!form.project_id && !isEditing) {
      setError("Please select a project.");
      return;
    }

    const payload = {
      ...form,
      title: form.title.trim(),
      description: form.description.trim(),
      priority: form.priority.toLowerCase(),
      story_points:
        form.story_points === ""
          ? null
          : Number(form.story_points),
      due_date: form.due_date || null,
      assignee_id: form.assignee_id || null,
      labels: form.labels,
    };

    try {
      await onSubmit?.(payload);
    } catch (err) {
      setError(
        err?.response?.data?.detail ||
        err?.message ||
        "Unable to save the issue."
      );
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-5">
      <Input
        label="Issue title"
        name="title"
        value={form.title}
        onChange={updateField}
        placeholder="e.g. Fix login authentication error"
        required
      />

      <div className="space-y-1.5">
        <label className="block text-sm font-medium text-slate-700 dark:text-slate-300">
          Description
        </label>

        <textarea
          name="description"
          value={form.description}
          onChange={updateField}
          rows={4}
          placeholder="Describe the issue, expected behavior, and steps to reproduce..."
          className="w-full resize-y rounded-lg border border-slate-300 bg-white px-3 py-2.5 text-sm text-slate-800 outline-none transition focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100 dark:border-slate-700 dark:bg-slate-900 dark:text-white dark:focus:ring-indigo-900/40"
        />
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <Dropdown
          label="Issue type"
          name="type"
          value={form.type}
          onChange={updateField}
          options={typeOptions}
        />

        <Dropdown
          label="Priority"
          name="priority"
          value={form.priority}
          onChange={updateField}
          options={priorityOptions}
        />
      </div>

      {!isEditing && (
        <Dropdown
          label="Project"
          name="project_id"
          value={form.project_id}
          onChange={updateField}
          placeholder="Select a project"
          required
          options={projects.map((project) => ({
            label: `${project.key} - ${project.name}`,
            value: project.id,
          }))}
        />
      )}

      <Dropdown
        label="Assignee"
        name="assignee_id"
        value={form.assignee_id}
        onChange={updateField}
        placeholder="Unassigned"
        options={members.map((member) => ({
          label:
            member.full_name ||
            member.name ||
            member.email,
          value: member.id,
        }))}
      />

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <Input
          label="Story points"
          name="story_points"
          type="number"
          min="0"
          max="100"
          value={form.story_points}
          onChange={updateField}
          placeholder="e.g. 5"
        />

        <Input
          label="Due date"
          name="due_date"
          type="date"
          value={form.due_date}
          onChange={updateField}
        />
      </div>

      <div className="space-y-2">
        <label className="block text-sm font-medium text-slate-700 dark:text-slate-300">
          Labels
        </label>

        <div className="flex gap-2">
          <input
            value={labelInput}
            onChange={(event) =>
              setLabelInput(event.target.value)
            }
            onKeyDown={(event) => {
              if (event.key === "Enter") {
                event.preventDefault();
                addLabel();
              }
            }}
            placeholder="Add a label"
            className="min-w-0 flex-1 rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm outline-none focus:border-indigo-500 dark:border-slate-700 dark:bg-slate-900 dark:text-white"
          />

          <Button
            type="button"
            variant="outline"
            onClick={addLabel}
          >
            Add
          </Button>
        </div>

        <div className="flex flex-wrap gap-2">
          {form.labels.map((label) => (
            <span
              key={label}
              className="inline-flex items-center gap-2 rounded-full bg-indigo-50 px-3 py-1 text-xs font-medium text-indigo-700 dark:bg-indigo-500/15 dark:text-indigo-300"
            >
              {label}
              <button
                type="button"
                onClick={() => removeLabel(label)}
                aria-label={`Remove ${label}`}
                className="font-bold hover:text-red-500"
              >
                ?
              </button>
            </span>
          ))}
        </div>
      </div>

      {error && (
        <p role="alert" className="text-sm text-red-500">
          {error}
        </p>
      )}

      <div className="flex justify-end gap-3 border-t border-slate-200 pt-4 dark:border-slate-800">
        {onCancel && (
          <Button
            type="button"
            variant="outline"
            onClick={onCancel}
            disabled={loading}
          >
            Cancel
          </Button>
        )}

        <Button type="submit" loading={loading}>
          {isEditing ? "Save Changes" : "Create Issue"}
        </Button>
      </div>
    </form>
  );
}
