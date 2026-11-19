
import { useCallback, useEffect, useState } from "react";

import {
  getProjects,
  getProjectById,
  createProject as createProjectRequest,
  updateProject as updateProjectRequest,
  deleteProject as deleteProjectRequest,
} from "../services/projectService";

const extractData = (response) => response?.data ?? response;

const extractList = (response) => {
  const data = extractData(response);

  if (Array.isArray(data)) return data;

  return data?.items || data?.projects || [];
};

export default function useProjects({ autoFetch = true } = {}) {
  const [projects, setProjects] = useState([]);
  const [loading, setLoading] = useState(autoFetch);
  const [error, setError] = useState("");

  const fetchProjects = useCallback(async () => {
    setLoading(true);
    setError("");

    try {
      const response = await getProjects();
      const projectList = extractList(response);

      setProjects(projectList);
      return projectList;
    } catch (err) {
      const message =
        err?.response?.data?.detail ||
        "Failed to load projects.";

      setError(message);
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  const fetchProjectById = useCallback(async (projectId) => {
    try {
      setError("");

      const response = await getProjectById(projectId);
      return extractData(response);
    } catch (err) {
      setError(
        err?.response?.data?.detail ||
          "Failed to load project details."
      );

      throw err;
    }
  }, []);

  const addProject = useCallback(async (projectData) => {
    try {
      setError("");

      const response = await createProjectRequest(projectData);
      const newProject = extractData(response);

      if (newProject?.id) {
        setProjects((current) => [newProject, ...current]);
      }

      return newProject;
    } catch (err) {
      setError(
        err?.response?.data?.detail ||
          "Failed to create project."
      );

      throw err;
    }
  }, []);

  const editProject = useCallback(
    async (projectId, projectData) => {
      try {
        setError("");

        const response = await updateProjectRequest(
          projectId,
          projectData
        );

        const updatedProject = extractData(response);

        setProjects((current) =>
          current.map((project) =>
            project.id === projectId
              ? { ...project, ...updatedProject }
              : project
          )
        );

        return updatedProject;
      } catch (err) {
        setError(
          err?.response?.data?.detail ||
            "Failed to update project."
        );

        throw err;
      }
    },
    []
  );

  const removeProject = useCallback(async (projectId) => {
    try {
      setError("");

      await deleteProjectRequest(projectId);

      setProjects((current) =>
        current.filter((project) => project.id !== projectId)
      );
    } catch (err) {
      setError(
        err?.response?.data?.detail ||
          "Failed to delete project."
      );

      throw err;
    }
  }, []);

  const clearError = useCallback(() => {
    setError("");
  }, []);

  useEffect(() => {
    if (autoFetch) {
      fetchProjects().catch(() => {});
    }
  }, [autoFetch, fetchProjects]);

  return {
    projects,
    loading,
    error,

    fetchProjects,
    fetchProjectById,

    addProject,
    editProject,
    removeProject,

    clearError,
    setProjects,
  };
}
