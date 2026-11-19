
import React from "react";
import {
  BrowserRouter,
  Navigate,
  Route,
  Routes,
} from "react-router-dom";

import { AuthProvider } from "../context/AuthContext";

import ProtectedRoute from "../components/layout/ProtectedRoute";
import DashboardLayout from "../components/layout/DashboardLayout";

import Login from "../pages/auth/Login";
import Register from "../pages/auth/Register";

import Dashboard from "../pages/dashboard/Dashboard";

import Projects from "../pages/projects/Projects";
import ProjectDetails from "../pages/projects/ProjectDetails";
import CreateProject from "../pages/projects/CreateProject";

import Issues from "../pages/issues/Issues";
import CreateIssue from "../pages/issues/CreateIssue";
import IssueDetails from "../pages/issues/IssueDetails";

import Kanban from "../pages/kanban/Kanban";
import Team from "../pages/team/Team";

import NotFound from "../pages/NotFound";

export default function AppRoutes() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <Routes>
          {/* Public routes */}
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />

          {/* Protected application routes */}
          <Route element={<ProtectedRoute />}>
            <Route element={<DashboardLayout />}>
              <Route
                path="/"
                element={<Navigate to="/dashboard" replace />}
              />

              <Route path="/dashboard" element={<Dashboard />} />

              {/* Projects */}
              <Route path="/projects" element={<Projects />} />

              <Route
                path="/projects/create"
                element={<CreateProject />}
              />

              <Route
                path="/projects/:projectId"
                element={<ProjectDetails />}
              />

              {/* Issues */}
              <Route path="/issues" element={<Issues />} />

              <Route
                path="/issues/create"
                element={<CreateIssue />}
              />

              <Route
                path="/issues/:issueId"
                element={<IssueDetails />}
              />

              {/* Kanban */}
              <Route path="/kanban" element={<Kanban />} />

              {/* Team */}
              <Route path="/team" element={<Team />} />
            </Route>
          </Route>

          {/* 404 */}
          <Route path="*" element={<NotFound />} />
        </Routes>
      </AuthProvider>
    </BrowserRouter>
  );
}
