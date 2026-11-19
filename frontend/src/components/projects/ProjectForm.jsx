
import React, { useEffect, useState } from "react";
import { FaFolder } from "react-icons/fa";
import Button from "../common/Button";
import Input from "../common/Input";

const initialForm = {
  name: "",
  key: "",
  description: "",
};

function generateProjectKey(name) {
  return name
    .trim()
    .split(/\s+/)
    .map((word) => word[0])
    .join("")
    .replace(/[^a-zA-Z0-9]/g, "")
    .toUpperCase()
    .slice(0, 10);
}

export default function ProjectForm({
  initialData = null,
  onSubmit,
  onCancel,
  loading = false,
}) {
  const [form, setForm] = useState(initialForm);
  const [keyManuallyEdited, setKeyManuallyEdited] =
    useState(false);
  const [error, setError] = useState("");

  const isEditing = Boolean(initialData?.id);

  useEffect(() => {
    if (initialData) {
      setForm({
        name: initialData.name || "",
        key: initialData.key || "",
        description: initialData.description || "",
      });
      setKeyManuallyEdited(true);
    } else {
      setForm(initialForm);
      setKeyManuallyEdited(false);
    }
  }, [initialData]);

  const handleNameChange = (event) => {
    const name = event.target.value;

    setForm((previous) => ({
      ...previous,
      name,
      ...(!keyManuallyEdited
        ? { key: generateProjectKey(name) }
        : {}),
    }));
  };

  const handleKeyChange = (event) => {
    const key = event.target.value
      .toUpperCase()
      .replace(/[^A-Z0-9_]/g, "")
      .slice(0, 10);

    setKeyManuallyEdited(true);

    setForm((previous) => ({
      ...previous,
      key,
    }));
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    setError("");

    if (!form.name.trim()) {
      setError("Project name is required.");
      return;
    }

    if (!/^[A-Z][A-Z0-9_]{1,9}$/.test(form.key)) {
      setError(
        "Project key must start with a letter and contain 2–10 uppercase letters, numbers, or underscores."
      );
      return;
    }

    try {
      await onSubmit?.({
        name: form.name.trim(),
        key: form.key,
        description: form.description.trim(),
      });
    } catch (err) {
      setError(
        err?.response?.data?.detail ||
        err?.message ||
        "Unable to save the project."
      );
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-5">
      <div className="flex items-center gap-3 rounded-xl bg-indigo-50 p-4 dark:bg-indigo-500/10">
        <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-indigo-600 text-white">
          <FaFolder />
        </div>

        <div>
          <p className="text-sm font-semibold text-indigo-900 dark:text-indigo-200">
            {isEditing ? "Update Project" : "Create New Project"}
          </p>
          <p className="text-xs text-indigo-700 dark:text-indigo-300">
            Organize your team's issues and tasks.
          </p>
        </div>
      </div>

      <Input
        label="Project name"
        name="name"
        value={form.name}
        onChange={handleNameChange}
        placeholder="e.g. Website Redesign"
        required
      />

      <Input
        label="Project key"
        name="key"
        value={form.key}
        onChange={handleKeyChange}
        placeholder="e.g. WEB"
        required
      />

      <p className="-mt-3 text-xs text-slate-500 dark:text-slate-400">
        This key identifies issues in this project, such as WEB-001.
        Use 2–10 uppercase letters, numbers, or underscores.
      </p>

      <div className="space-y-1.5">
        <label className="block text-sm font-medium text-slate-700 dark:text-slate-300">
          Description
        </label>

        <textarea
          name="description"
          value={form.description}
          onChange={(event) =>
            setForm((previous) => ({
              ...previous,
              description: event.target.value,
            }))
          }
          rows={4}
          placeholder="Describe the purpose of this project..."
          className="w-full resize-y rounded-lg border border-slate-300 bg-white px-3 py-2.5 text-sm text-slate-800 outline-none transition focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100 dark:border-slate-700 dark:bg-slate-900 dark:text-white dark:focus:ring-indigo-900/40"
        />
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
          {isEditing ? "Save Changes" : "Create Project"}
        </Button>
      </div>
    </form>
  );
}
