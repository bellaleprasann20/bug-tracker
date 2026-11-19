
import React from "react";
import { NavLink } from "react-router-dom";
import {
  FaTimes,
  FaTachometerAlt,
  FaFolder,
  FaBug,
  FaColumns,
  FaUsers,
  FaTimesCircle,
} from "react-icons/fa";

const navigation = [
  {
    label: "Dashboard",
    path: "/dashboard",
    icon: FaTachometerAlt,
  },
  {
    label: "Projects",
    path: "/projects",
    icon: FaFolder,
  },
  {
    label: "Issues",
    path: "/issues",
    icon: FaBug,
  },
  {
    label: "Kanban Board",
    path: "/kanban",
    icon: FaColumns,
  },
];

export default function Sidebar({
  isOpen = false,
  onClose,
  user,
}) {
  const isAdmin =
    user?.role?.toLowerCase() === "admin";

  const navItems = [
    ...navigation,
    ...(isAdmin
      ? [
          {
            label: "Team",
            path: "/team",
            icon: FaUsers,
          },
        ]
      : []),
  ];

  return (
    <>
      {/* Mobile backdrop */}
      {isOpen && (
        <button
          type="button"
          aria-label="Close sidebar"
          onClick={onClose}
          className="fixed inset-0 z-40 bg-black/50 lg:hidden"
        />
      )}

      <aside
        className={`
          fixed inset-y-0 left-0 z-50 flex w-64
          flex-col border-r border-slate-200
          bg-white transition-transform duration-300
          dark:border-slate-800 dark:bg-slate-950
          lg:static lg:z-0 lg:translate-x-0
          ${
            isOpen
              ? "translate-x-0"
              : "-translate-x-full"
          }
        `}
      >
        {/* Sidebar header */}
        <div className="flex h-16 items-center justify-between border-b border-slate-200 px-5 dark:border-slate-800">
          <div className="flex items-center gap-3">
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-indigo-600 text-lg font-bold text-white">
              B
            </div>

            <div>
              <h2 className="text-sm font-bold text-slate-900 dark:text-white">
                Bug Tracker
              </h2>

              <p className="text-xs text-slate-500 dark:text-slate-400">
                Issue Management
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="rounded-lg p-2 text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-800 lg:hidden"
            aria-label="Close sidebar"
          >
            <FaTimes />
          </button>
        </div>

        {/* Navigation */}
        <nav className="flex-1 space-y-1 overflow-y-auto px-3 py-5">
          <p className="mb-3 px-3 text-xs font-semibold uppercase tracking-wider text-slate-400">
            Workspace
          </p>

          {navItems.map((item) => {
            const Icon = item.icon;

            return (
              <NavLink
                key={item.path}
                to={item.path}
                end={item.path === "/dashboard"}
                onClick={onClose}
                className={({ isActive }) =>
                  `
                    flex items-center gap-3 rounded-lg
                    px-3 py-2.5 text-sm font-medium
                    transition-all duration-200
                    ${
                      isActive
                        ? "bg-indigo-50 text-indigo-700 dark:bg-indigo-500/15 dark:text-indigo-300"
                        : "text-slate-600 hover:bg-slate-100 hover:text-slate-900 dark:text-slate-400 dark:hover:bg-slate-800 dark:hover:text-white"
                    }
                  `
                }
              >
                <Icon className="text-base" />
                <span>{item.label}</span>
              </NavLink>
            );
          })}
        </nav>

        {/* Footer */}
        <div className="border-t border-slate-200 p-4 dark:border-slate-800">
          <div className="rounded-xl bg-slate-50 p-3 dark:bg-slate-900">
            <p className="text-xs font-medium text-slate-500 dark:text-slate-400">
              Signed in as
            </p>

            <p className="mt-1 truncate text-sm font-semibold capitalize text-slate-800 dark:text-white">
              {user?.role || "Member"}
            </p>
          </div>
        </div>
      </aside>
    </>
  );
}
