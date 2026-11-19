
import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import {
  FaUsers,
  FaUser,
  FaFolder,
  FaSyncAlt,
  FaExclamationCircle,
} from "react-icons/fa";

import Loader from "../../components/common/Loader";
import MemberList from "../../components/projects/MemberList";
import { getProjects } from "../../services/projectService";
import { getProjectMembers } from "../../services/memberService";

export default function Team() {
  const [projects, setProjects] = useState([]);
  const [selectedProjectId, setSelectedProjectId] = useState("");
  const [members, setMembers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [membersLoading, setMembersLoading] = useState(false);
  const [error, setError] = useState("");

  const fetchProjects = async () => {
    setLoading(true);
    setError("");

    try {
      const response = await getProjects();

      const projectList = Array.isArray(response)
        ? response
        : response?.items || response?.projects || [];

      setProjects(projectList);

      if (projectList.length > 0) {
        setSelectedProjectId((current) =>
          current || projectList[0].id
        );
      }
    } catch (err) {
      setError(
        err?.response?.data?.detail ||
          "Unable to load projects."
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProjects();
  }, []);

  useEffect(() => {
    if (!selectedProjectId) {
      setMembers([]);
      return;
    }

    let cancelled = false;

    const fetchMembers = async () => {
      setMembersLoading(true);
      setError("");

      try {
        const response = await getProjectMembers(selectedProjectId);

        const memberList = Array.isArray(response)
          ? response
          : response?.items || response?.members || [];

        if (!cancelled) {
          setMembers(memberList);
        }
      } catch (err) {
        if (!cancelled) {
          setMembers([]);
          setError(
            err?.response?.data?.detail ||
              "Unable to load team members."
          );
        }
      } finally {
        if (!cancelled) {
          setMembersLoading(false);
        }
      }
    };

    fetchMembers();

    return () => {
      cancelled = true;
    };
  }, [selectedProjectId]);

  if (loading) {
    return <Loader fullscreen message="Loading team..." />;
  }

  const selectedProject = projects.find(
    (project) => project.id === selectedProjectId
  );

  return (
    <div className="space-y-7">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <p className="text-sm font-semibold text-indigo-600 dark:text-indigo-400">
            COLLABORATION
          </p>

          <h1 className="mt-1 text-3xl font-bold text-slate-900 dark:text-white">
            Team
          </h1>

          <p className="mt-2 text-sm text-slate-500 dark:text-slate-400">
            View the people collaborating on your projects.
          </p>
        </div>

        <button
          type="button"
          onClick={fetchProjects}
          className="inline-flex items-center justify-center gap-2 rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm font-medium text-slate-700 hover:bg-slate-50 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-200"
        >
          <FaSyncAlt />
          Refresh
        </button>
      </div>

      {error && (
        <div
          role="alert"
          className="flex items-center gap-3 rounded-xl border border-red-200 bg-red-50 p-4 text-sm text-red-600 dark:border-red-500/30 dark:bg-red-500/10 dark:text-red-400"
        >
          <FaExclamationCircle />
          {error}
        </div>
      )}

      {projects.length === 0 ? (
        <div className="rounded-2xl border border-dashed border-slate-300 bg-white py-16 text-center dark:border-slate-700 dark:bg-slate-900">
          <FaUsers className="mx-auto text-4xl text-slate-300 dark:text-slate-600" />

          <h3 className="mt-4 font-semibold text-slate-800 dark:text-white">
            No projects available
          </h3>

          <p className="mt-2 text-sm text-slate-500 dark:text-slate-400">
            Join or create a project to view its team members.
          </p>

          <Link
            to="/projects"
            className="mt-5 inline-flex items-center gap-2 rounded-xl bg-indigo-600 px-4 py-2.5 text-sm font-semibold text-white hover:bg-indigo-700"
          >
            <FaFolder />
            View Projects
          </Link>
        </div>
      ) : (
        <>
          {/* Project selector */}
          <section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm dark:border-slate-800 dark:bg-slate-900">
            <label
              htmlFor="team-project"
              className="mb-2 block text-sm font-semibold text-slate-700 dark:text-slate-300"
            >
              Select Project
            </label>

            <select
              id="team-project"
              value={selectedProjectId}
              onChange={(event) =>
                setSelectedProjectId(event.target.value)
              }
              className="w-full rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-800 outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/10 dark:border-slate-700 dark:bg-slate-950 dark:text-white sm:max-w-md"
            >
              {projects.map((project) => (
                <option key={project.id} value={project.id}>
                  {project.name} ({project.key})
                </option>
              ))}
            </select>

            {selectedProject && (
              <p className="mt-3 text-xs text-slate-500 dark:text-slate-400">
                Viewing members of{" "}
                <span className="font-semibold text-indigo-600 dark:text-indigo-400">
                  {selectedProject.name}
                </span>
              </p>
            )}
          </section>

          {/* Team summary */}
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm dark:border-slate-800 dark:bg-slate-900">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-slate-500 dark:text-slate-400">
                    Team Members
                  </p>

                  <h2 className="mt-2 text-3xl font-bold text-slate-900 dark:text-white">
                    {members.length}
                  </h2>
                </div>

                <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-indigo-50 text-xl text-indigo-600 dark:bg-indigo-500/10 dark:text-indigo-400">
                  <FaUsers />
                </div>
              </div>
            </div>

            <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm dark:border-slate-800 dark:bg-slate-900">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-slate-500 dark:text-slate-400">
                    Current Project
                  </p>

                  <h2 className="mt-2 text-xl font-bold text-slate-900 dark:text-white">
                    {selectedProject?.key || "—"}
                  </h2>

                  <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">
                    {selectedProject?.name || ""}
                  </p>
                </div>

                <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-blue-50 text-xl text-blue-600 dark:bg-blue-500/10 dark:text-blue-400">
                  <FaFolder />
                </div>
              </div>
            </div>
          </div>

          {/* Members list */}
          <section className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm dark:border-slate-800 dark:bg-slate-900">
            <div className="mb-5 flex items-center justify-between">
              <div>
                <h2 className="text-lg font-semibold text-slate-900 dark:text-white">
                  Project Members
                </h2>

                <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
                  Team members and their assigned roles.
                </p>
              </div>

              <FaUser className="text-indigo-500" />
            </div>

            {membersLoading ? (
              <Loader message="Loading members..." />
            ) : (
              <MemberList members={members} />
            )}
          </section>
        </>
      )}
    </div>
  );
}
