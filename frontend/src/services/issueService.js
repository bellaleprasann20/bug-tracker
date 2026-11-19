
import api from "./api";

// Get issues with optional filters and pagination.
export async function getIssues(params = {}) {
  const { data } = await api.get("/issues", { params });
  return data;
}

// Get one issue.
export async function getIssueById(issueId) {
  const { data } = await api.get(`/issues/${issueId}`);
  return data;
}

// Create an issue.
export async function createIssue(issueData) {
  const { data } = await api.post("/issues", issueData);
  return data;
}

// Update an issue.
export async function updateIssue(issueId, issueData) {
  const { data } = await api.patch(
    `/issues/${issueId}`,
    issueData
  );

  return data;
}

// Delete an issue.
export async function deleteIssue(issueId) {
  const { data } = await api.delete(`/issues/${issueId}`);
  return data;
}
