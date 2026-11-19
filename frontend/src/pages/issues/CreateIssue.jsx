
import React, { useEffect, useState } from "react";
import { Link, useNavigate, useSearchParams } from "react-router-dom";
import { FaArrowLeft, FaBug } from "react-icons/fa";

import IssueForm from "../../components/issues/IssueForm";
import Loader from "../../components/common/Loader";
import { createIssue } from "../../services/issueService";
import { getProjects } from "../../services/projectService";
import { getProjectMembers } from "../../services/memberService";

export default function CreateIssue() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();

  const selectedProjectId = searchParams.get("project_id") || "";

  const [projects, setProjects] = useState([]);
  const [members, setMembers] = useState([]);
  const [loadingData, setLoadingData] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    const loadFormData = async () => {
      setLoadingData(true);
      setError("");

      try {
        const response = await getProjects();

        const projectList = Array.isArray(response)
          ? response
          : response?.items || response?.projects || [];

        setProjects(projectList);

        if (selectedProjectId) {
          const memberResponse = await getProjectMembers(selectedProjectId);

          const memberList = Array.isArray(memberResponse)
            ? memberResponse
            : memberResponse?.items || memberResponse?.members || [];

          setMembers(memberList);
        }
      } catch (err) {
        setError(
          err?.response?.data?.detail ||
            "Unable to load project information."
        );
      } finally {
        setLoadingData(false);
      }
    };

    loadFormData();
  }, [selectedProjectId]);

  const handleSubmit = async (payload) => {
    setSaving(true);
    setError("");

    try {
      const issue = await createIssue(payload);

      navigate(`/issues/${issue.id}`, {
        replace: true,
      });
    } catch (err) {
      const detail = err?.response?.data?.detail;

      setError(
        typeof detail === "string"
          ? detail
          : "Unable to create issue. Please try again."
      );
    } finally {
      setSaving(false);
    }
  };

  if (loadingData) {
    return <Loader fullscreen message="Preparing issue form..." />;
  }

  return (
    <div className="mx-auto max-w-4xl space-y-6">
      <Link
        to="/issues"
        className="inline-flex items-center gap-2 text-sm font-medium text-slate-500 transition hover:text-indigo-600 dark:text-slate-400 dark:hover:text-indigo-400"
      >
        <FaArrowLeft />
        Back to Issues
      </Link>

      <div className="flex items-center gap-3">
        <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-indigo-50 text-xl text-indigo-600 dark:bg-indigo-500/10 dark:text-indigo-400">
          <FaBug />
        </div>

        <div>
          <h1 className="text-2xl font-bold text-slate-900 dark:text-white">
            Create New Issue
          </h1>

          <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
            Report a bug, create a task, or request a feature.
          </p>
        </div>
      </div>

      {error && (
        <div
          role="alert"
          className="rounded-xl border border-red-200 bg-red-50 p-4 text-sm text-red-600 dark:border-red-500/30 dark:bg-red-500/10 dark:text-red-400"
        >
          {error}
        </div>
      )}

      <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm dark:border-slate-800 dark:bg-slate-900 sm:p-8">
        {projects.length === 0 ? (
          <div className="py-8 text-center">
            <p className="font-medium text-slate-800 dark:text-white">
              No projects available
            </p>

            <p className="mt-2 text-sm text-slate-500 dark:text-slate-400">
              You need access to a project before creating an issue.
            </p>

            <Link
              to="/projects"
              className="mt-5 inline-flex items-center gap-2 rounded-xl bg-indigo-600 px-4 py-2.5 text-sm font-semibold text-white hover:bg-indigo-700"
            >
              View Projects
            </Link>
          </div>
        ) : (
          <IssueForm
            initialData={
              selectedProjectId
                ? { project_id: selectedProjectId }
                : undefined
            }
            projects={projects}
            members={members}
            onSubmit={handleSubmit}
            onCancel={() => navigate("/issues")}
            loading={saving}
          />
        )}
      </div>
    </div>
  );
}
