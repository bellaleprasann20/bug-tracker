import api from "./api";

// Get comments belonging to an issue.
export async function getIssueComments(issueId) {
  const { data } = await api.get(
    `/comments/issue/${issueId}`
  );

  return data;
}

// Add a comment or threaded reply.
export async function createComment(issueId, commentData) {
  const { data } = await api.post("/comments/", {
    ...commentData,
    issue_id: issueId,
  });

  return data;
}

// Update a comment.
export async function updateComment(commentId, commentData) {
  const { data } = await api.patch(
    `/comments/${commentId}`,
    commentData
  );

  return data;
}

// Delete a comment.
export async function deleteComment(commentId) {
  const { data } = await api.delete(
    `/comments/${commentId}`
  );

  return data;
}
