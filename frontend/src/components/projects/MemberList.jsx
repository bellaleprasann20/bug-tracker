
import React from "react";
import {
  FaUserCircle,
  FaUserShield,
  FaUser,
  FaTrash,
} from "react-icons/fa";
import Dropdown from "../common/Dropdown";

const roleOptions = [
  { label: "Admin", value: "admin" },
  { label: "Developer", value: "developer" },
  { label: "Viewer", value: "viewer" },
];

const roleStyles = {
  admin:
    "bg-purple-100 text-purple-700 dark:bg-purple-500/15 dark:text-purple-300",
  developer:
    "bg-blue-100 text-blue-700 dark:bg-blue-500/15 dark:text-blue-300",
  viewer:
    "bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-300",
};

function getInitials(name) {
  return name
    .split(" ")
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0].toUpperCase())
    .join("");
}

export default function MemberList({
  members = [],
  currentUserId,
  canManage = false,
  onRoleChange,
  onRemove,
  loading = false,
}) {
  if (members.length === 0) {
    return (
      <div className="rounded-xl border border-dashed border-slate-300 p-8 text-center dark:border-slate-700">
        <FaUserCircle className="mx-auto text-3xl text-slate-300 dark:text-slate-600" />

        <p className="mt-3 text-sm font-medium text-slate-700 dark:text-slate-300">
          No project members found.
        </p>

        <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">
          Add team members to collaborate on this project.
        </p>
      </div>
    );
  }

  return (
    <div className="overflow-hidden rounded-xl border border-slate-200 bg-white dark:border-slate-800 dark:bg-slate-900">
      <div className="flex items-center justify-between border-b border-slate-200 px-5 py-4 dark:border-slate-800">
        <div>
          <h3 className="text-base font-semibold text-slate-900 dark:text-white">
            Project Members
          </h3>

          <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">
            {members.length} member{members.length !== 1 ? "s" : ""}
          </p>
        </div>
      </div>

      <div className="divide-y divide-slate-100 dark:divide-slate-800">
        {members.map((member) => {
          const name =
            member.user?.full_name ||
            member.full_name ||
            member.user?.name ||
            member.name ||
            member.email ||
            "Unknown user";

          const email =
            member.user?.email || member.email || "";

          const role = (
            member.role || "developer"
          ).toLowerCase();

          const memberId =
            member.user_id ||
            member.user?.id ||
            member.id;

          const isCurrentUser =
            memberId === currentUserId;

          return (
            <div
              key={member.id || memberId}
              className="flex flex-col gap-3 px-5 py-4 sm:flex-row sm:items-center sm:justify-between"
            >
              <div className="flex min-w-0 items-center gap-3">
                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-indigo-100 text-sm font-bold text-indigo-700 dark:bg-indigo-500/20 dark:text-indigo-300">
                  {getInitials(name) || "U"}
                </div>

                <div className="min-w-0">
                  <div className="flex flex-wrap items-center gap-2">
                    <p className="truncate text-sm font-semibold text-slate-800 dark:text-white">
                      {name}
                    </p>

                    {isCurrentUser && (
                      <span className="text-xs text-indigo-600 dark:text-indigo-400">
                        You
                      </span>
                    )}
                  </div>

                  <p className="truncate text-xs text-slate-500 dark:text-slate-400">
                    {email}
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-3 sm:justify-end">
                {canManage && !isCurrentUser ? (
                  <div className="w-36">
                    <Dropdown
                      name={`role-${memberId}`}
                      value={role}
                      onChange={(event) =>
                        onRoleChange?.(
                          memberId,
                          event.target.value
                        )
                      }
                      options={roleOptions}
                      disabled={loading}
                    />
                  </div>
                ) : (
                  <span
                    className={`inline-flex items-center gap-2 rounded-full px-3 py-1.5 text-xs font-semibold capitalize ${
                      roleStyles[role] || roleStyles.developer
                    }`}
                  >
                    {role === "admin" ? (
                      <FaUserShield />
                    ) : (
                      <FaUser />
                    )}
                    {role}
                  </span>
                )}

                {canManage && !isCurrentUser && (
                  <button
                    type="button"
                    onClick={() => onRemove?.(member)}
                    disabled={loading}
                    aria-label={`Remove ${name}`}
                    title={`Remove ${name}`}
                    className="rounded-lg p-2 text-slate-400 transition hover:bg-red-50 hover:text-red-600 disabled:opacity-50 dark:hover:bg-red-500/10"
                  >
                    <FaTrash />
                  </button>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
