
import React, { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import {
  FaPlus,
  FaFolderOpen,
  FaSearch,
  FaSyncAlt,
  FaExclamationCircle,
} from "react-icons/fa";

import ProjectCard from "../../components/projects/ProjectCard";
import Loader from "../../components/common/Loader";
import Modal from "../../components/common/Modal";
import ProjectForm from "../../components/projects/ProjectForm";
import { useAuth } from "../../context/AuthContext";
import {
  getProjects,
  createProject,
  deleteProject,
} from "../../services/projectService";

export default function Projects() {
  const { user } = useAuth();

  const [projects, setProjects] = useState([]);
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [formError, setFormError] = useState("");
  const [showCreateModal, setShowCreateModal] = useState(false);

  const canCreate = user?.role === "admin" || user?.role === "developer";

  const fetchProjects = async () => {
    setLoading(true);
    setError("");

    try {
      const response = await getProjects();

      const projectList = Array.isArray(response)
        ? response
        : response?.items || response?.projects || [];

      setProjects(projectList);
    } catch (err) {
      setError(
        err?.response?.data?.detail ||
          "Unable to load projects. Please try again."
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProjects();
  }, []);

  const filteredProjects = useMemo(() => {
    const query = search.trim().toLowerCase();

    if (!query) return projects;

    return projects.filter((project) => {
      return (
        project.name?.toLowerCase().includes(query) ||
        project.key?.toLowerCase().includes(query) ||
        project.description?.toLowerCase().includes(query)
      );
    });
  }, [projects, search]);

  const handleCreate = async (payload) => {
    setSaving(true);
    setFormError("");

    try {
      const createdProject = await createProject(payload);

      setProjects((previous) => [
        createdProject,
        ...previous,
      ]);

      setShowCreateModal(false);
    } catch (err) {
      setFormError(
        err?.response?.data?.detail ||
          "Unable to create project."
      );
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (projectId) => {
    const confirmed = window.confirm(
      "Are you sure you want to delete this project? This action cannot be undone."
    );

    if (!confirmed) return;

    try {
      await deleteProject(projectId);

      setProjects((previous) =>
        previous.filter((project) => project.id !== projectId)
      );
    } catch (err) {
      setError(
        err?.response?.data?.detail ||
          "Unable to delete project."
      );
    }
  };

  if (loading) {
    return <Loader fullscreen message="Loading projects..." />;
  }

  return (
    <div className="space-y-7">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <p className="text-sm font-semibold text-indigo-600 dark:text-indigo-400">
            WORKSPACE
          </p>

          <h1 className="mt-1 text-3xl font-bold text-slate-900 dark:text-white">
            Projects
          </h1>

          <p className="mt-2 text-sm text-slate-500 dark:text-slate-400">
            Manage and organize your development projects.
          </p>
        </div>

        {canCreate && (
          <button
            type="button"
            onClick={() => {
              setFormError("");
              setShowCreateModal(true);
            }}
            className="inline-flex items-center justify-center gap-2 rounded-xl bg-indigo-600 px-5 py-3 text-sm font-semibold text-white transition hover:bg-indigo-700"
          >
            <FaPlus />
            Create Project
          </button>
        )}
      </div>

      {error && (
        <div
          role="alert"
          className="flex items-center justify-between gap-3 rounded-xl border border-red-200 bg-red-50 p-4 text-sm text-red-600 dark:border-red-500/30 dark:bg-red-500/10 dark:text-red-400"
        >
          <span className="flex items-center gap-2">
            <FaExclamationCircle />
            {error}
          </span>

          <button
            type="button"
            onClick={fetchProjects}
            className="font-semibold underline"
          >
            Retry
          </button>
        </div>
      )}

      <div className="flex flex-col gap-3 sm:flex-row">
        <div className="relative flex-1">
          <FaSearch className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" />

          <input
            type="search"
            value={search}
            onChange={(event) => setSearch(event.target.value)}
            placeholder="Search by project name, key, or description..."
            className="w-full rounded-xl border border-slate-200 bg-white py-3 pl-11 pr-4 text-sm text-slate-800 outline-none transition focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/10 dark:border-slate-700 dark:bg-slate-900 dark:text-white"
          />
        </div>

        <button
          type="button"
          onClick={fetchProjects}
          className="inline-flex items-center justify-center gap-2 rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm font-medium text-slate-700 transition hover:bg-slate-50 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-200"
        >
          <FaSyncAlt />
          Refresh
        </button>
      </div>

      <div className="flex items-center justify-between">
        <p className="text-sm font-medium text-slate-600 dark:text-slate-300">
          {filteredProjects.length}{" "}
          {filteredProjects.length === 1 ? "project" : "projects"} found
        </p>
      </div>

      {filteredProjects.length > 0 ? (
        <div className="grid grid-cols-1 gap-5 md:grid-cols-2 xl:grid-cols-3">
          {filteredProjects.map((project) => (
            <ProjectCard
              key={project.id}
              project={project}
              canManage={
                user?.role === "admin" ||
                project.owner_id === user?.id
              }
              onDelete={() => handleDelete(project.id)}
            />
          ))}
        </div>
      ) : (
        <div className="rounded-2xl border border-dashed border-slate-300 bg-white px-6 py-16 text-center dark:border-slate-700 dark:bg-slate-900">
          <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl bg-indigo-50 text-2xl text-indigo-600 dark:bg-indigo-500/10 dark:text-indigo-400">
            <FaFolderOpen />
          </div>

          <h3 className="mt-5 text-lg font-semibold text-slate-900 dark:text-white">
            {search ? "No matching projects" : "No projects yet"}
          </h3>

          <p className="mx-auto mt-2 max-w-sm text-sm text-slate-500 dark:text-slate-400">
            {search
              ? "Try a different search term."
              : "Create a project to start organizing your team's issues."}
          </p>

          {!search && canCreate && (
            <button
              type="button"
              onClick={() => setShowCreateModal(true)}
              className="mt-5 inline-flex items-center gap-2 rounded-xl bg-indigo-600 px-5 py-3 text-sm font-semibold text-white hover:bg-indigo-700"
            >
              <FaPlus />
              Create your first project
            </button>
          )}
        </div>
      )}

      <Modal
        isOpen={showCreateModal}
        onClose={() => {
          if (!saving) setShowCreateModal(false);
        }}
        title="Create New Project"
        size="lg"
      >
        {formError && (
          <div className="mb-4 rounded-lg bg-red-50 p-3 text-sm text-red-600 dark:bg-red-500/10 dark:text-red-400">
            {formError}
          </div>
        )}

        <ProjectForm
          onSubmit={handleCreate}
          onCancel={() => setShowCreateModal(false)}
          loading={saving}
        />
      </Modal>
    </div>
  );
}
