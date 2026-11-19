
import React from "react";
import {
  Navigate,
  Outlet,
  useLocation,
} from "react-router-dom";

import { useAuth } from "../../context/AuthContext";
import Loader from "../common/Loader";

export default function ProtectedRoute({
  allowedRoles = [],
}) {
  const { user, isAuthenticated, loading } = useAuth();

  const location = useLocation();

  // Wait until authentication status is checked.
  if (loading) {
    return (
      <Loader
        fullScreen
        message="Checking authentication..."
      />
    );
  }

  // Redirect unauthenticated users to login.
  if (!isAuthenticated || !user) {
    return (
      <Navigate
        to="/login"
        replace
        state={{ from: location }}
      />
    );
  }

  // Check allowed roles when specified.
  if (allowedRoles.length > 0) {
    const userRole = user.role?.toLowerCase();

    const permitted = allowedRoles.some(
      (role) => role.toLowerCase() === userRole
    );

    if (!permitted) {
      return <Navigate to="/dashboard" replace />;
    }
  }

  return <Outlet />;
}
