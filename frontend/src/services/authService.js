
import api from "./api";

// Register a new user.
export async function register(userData) {
  const { data } = await api.post("/auth/register", userData);
  return data;
}

// Login and receive JWT access token.
export async function login(credentials) {
  const { data } = await api.post("/auth/login", credentials);
  return data;
}

// Get the currently authenticated user.
export async function getCurrentUser() {
  const { data } = await api.get("/users/me");
  return data;
}

// Logout from the frontend.
export function logout() {
  localStorage.removeItem("access_token");
}
