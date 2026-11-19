
import { useCallback, useEffect, useState } from "react";

import {
  getIssues,
  getIssueById,
  createIssue as createIssueRequest,
  updateIssue as updateIssueRequest,
  deleteIssue as deleteIssueRequest,
} from "../services/issueService";

const extractData = (response) => response?.data ?? response;

const extractList = (response) => {
  const data = extractData(response);

  if (Array.isArray(data)) return data;

  return data?.items || data?.issues || [];
};

export default function useIssues({
  initialFilters = {},
  autoFetch = true,
} = {}) {
  const [issues, setIssues] = useState([]);
  const [filters, setFilters] = useState(initialFilters);
  const [loading, setLoading] = useState(autoFetch);
  const [error, setError] = useState("");

  const fetchIssues = useCallback(
    async (customFilters) => {
      setLoading(true);
      setError("");

      const activeFilters = customFilters ?? filters;

      try {
        const response = await getIssues(activeFilters);
        const issueList = extractList(response);

        setIssues(issueList);
        return issueList;
      } catch (err) {
        const message =
          err?.response?.data?.detail ||
          "Failed to load issues.";

        setError(message);
        throw err;
      } finally {
        setLoading(false);
      }
    },
    [filters]
  );

  const fetchIssueById = useCallback(async (issueId) => {
    try {
      setError("");

      const response = await getIssueById(issueId);
      return extractData(response);
    } catch (err) {
      setError(
        err?.response?.data?.detail ||
          "Failed to load issue details."
      );

      throw err;
    }
  }, []);

  const addIssue = useCallback(async (issueData) => {
    try {
      setError("");

      const response = await createIssueRequest(issueData);
      const newIssue = extractData(response);

      if (newIssue?.id) {
        setIssues((current) => [newIssue, ...current]);
      }

      return newIssue;
    } catch (err) {
      setError(
        err?.response?.data?.detail ||
          "Failed to create issue."
      );

      throw err;
    }
  }, []);

  const editIssue = useCallback(
    async (issueId, issueData) => {
      try {
        setError("");

        const response = await updateIssueRequest(
          issueId,
          issueData
        );

        const updatedIssue = extractData(response);

        setIssues((current) =>
          current.map((issue) =>
            issue.id === issueId
              ? { ...issue, ...updatedIssue }
              : issue
          )
        );

        return updatedIssue;
      } catch (err) {
        setError(
          err?.response?.data?.detail ||
            "Failed to update issue."
        );

        throw err;
      }
    },
    []
  );

  const removeIssue = useCallback(async (issueId) => {
    try {
      setError("");

      await deleteIssueRequest(issueId);

      setIssues((current) =>
        current.filter((issue) => issue.id !== issueId)
      );
    } catch (err) {
      setError(
        err?.response?.data?.detail ||
          "Failed to delete issue."
      );

      throw err;
    }
  }, []);

  const updateFilters = useCallback((nextFilters) => {
    setFilters((current) => ({
      ...current,
      ...nextFilters,
    }));
  }, []);

  const resetFilters = useCallback(() => {
    setFilters({});
  }, []);

  const clearError = useCallback(() => {
    setError("");
  }, []);

  useEffect(() => {
    if (autoFetch) {
      fetchIssues().catch(() => {});
    }
  }, [autoFetch, fetchIssues]);

  return {
    issues,
    filters,
    loading,
    error,

    fetchIssues,
    fetchIssueById,

    addIssue,
    editIssue,
    removeIssue,

    setFilters: updateFilters,
    resetFilters,
    clearError,
    setIssues,
  };
}
