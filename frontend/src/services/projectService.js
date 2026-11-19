
import api from "./api";

// Get all projects available to the authenticated user.
export async function getProjects(params = {}) {
  const { data } = await api.get("/projects", { params });
  return data;
}

// Get one project by ID.
export async function getProjectById(projectId) {
  const { data } = await api.get(`/projects/${projectId}`);
  return data;
}

// Create a project.
export async function createProject(projectData) {
  const { data } = await api.post("/projects", projectData);
  return data;
}

// Update a project.
export async function updateProject(projectId, projectData) {
  const { data } = await api.patch(
    `/projects/${projectId}`,
    projectData
  );

  return data;
}

// Delete a project.
export async function deleteProject(projectId) {
  const { data } = await api.delete(`/projects/${projectId}`);
  return data;
}

// Get project members.
export async function getProjectMembers(projectId) {
  const { data } = await api.get(
    `/projects/${projectId}/members`
  );

  return data;
}

// Add a member to a project.
export async function addProjectMember(projectId, memberData) {
  const { data } = await api.post(
    `/projects/${projectId}/members`,
    memberData
  );

  return data;
}

// Update a project member's role.
export async function updateProjectMember(
  projectId,
  userId,
  memberData
) {
  const { data } = await api.patch(
    `/projects/${projectId}/members/${userId}`,
    memberData
  );

  return data;
}

// Remove a member from a project.
export async function removeProjectMember(projectId, userId) {
  const { data } = await api.delete(
    `/projects/${projectId}/members/${userId}`
  );

  return data;
}
