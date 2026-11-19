
import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { FaArrowLeft, FaFolderPlus } from "react-icons/fa";

import ProjectForm from "../../components/projects/ProjectForm";
import { createProject } from "../../services/projectService";

export default function CreateProject() {
  const navigate = useNavigate();

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = async (payload) => {
    setLoading(true);
    setError("");

    try {
      const project = await createProject(payload);

      navigate(`/projects/${project.id}`, {
        replace: true,
      });
    } catch (err) {
      const detail = err?.response?.data?.detail;

      setError(
        typeof detail === "string"
          ? detail
          : "Unable to create project. Please try again."
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="mx-auto max-w-3xl space-y-6">
      <Link
        to="/projects"
        className="inline-flex items-center gap-2 text-sm font-medium text-slate-500 transition hover:text-indigo-600 dark:text-slate-400 dark:hover:text-indigo-400"
      >
        <FaArrowLeft />
        Back to Projects
      </Link>

      <div>
        <div className="flex items-center gap-3">
          <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-indigo-50 text-xl text-indigo-600 dark:bg-indigo-500/10 dark:text-indigo-400">
            <FaFolderPlus />
          </div>

          <div>
            <h1 className="text-2xl font-bold text-slate-900 dark:text-white">
              Create Project
            </h1>

            <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
              Set up a new workspace for your development team.
            </p>
          </div>
        </div>
      </div>

      <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm dark:border-slate-800 dark:bg-slate-900 sm:p-8">
        {error && (
          <div
            role="alert"
            className="mb-5 rounded-xl border border-red-200 bg-red-50 p-4 text-sm text-red-600 dark:border-red-500/30 dark:bg-red-500/10 dark:text-red-400"
          >
            {error}
          </div>
        )}

        <ProjectForm
          onSubmit={handleSubmit}
          onCancel={() => navigate("/projects")}
          loading={loading}
        />
      </div>
    </div>
  );
}
