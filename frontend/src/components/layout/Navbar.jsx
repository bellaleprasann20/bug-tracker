
import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  FaBars,
  FaSearch,
  FaChevronDown,
  FaSignOutAlt,
  FaUserCircle,
} from "react-icons/fa";
import { useAuth } from "../../context/AuthContext";

export default function Navbar({ onMenuClick, onSearch }) {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const [search, setSearch] = useState("");
  const [showUserMenu, setShowUserMenu] = useState(false);

  const fullName = user?.full_name || user?.name || "User";

  const initials = fullName
    .split(" ")
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0].toUpperCase())
    .join("");

  const handleSearch = (event) => {
    const value = event.target.value;
    setSearch(value);
    onSearch?.(value);
  };

  const handleLogout = async () => {
    setShowUserMenu(false);

    try {
      await logout();
      navigate("/login", { replace: true });
    } catch (error) {
      console.error("Logout failed:", error);
    }
  };

  return (
    <header className="sticky top-0 z-30 flex h-16 items-center justify-between border-b border-slate-200 bg-white px-4 dark:border-slate-800 dark:bg-slate-950 sm:px-6">
      <div className="flex min-w-0 items-center gap-3">
        <button
          type="button"
          onClick={onMenuClick}
          className="rounded-lg p-2 text-slate-600 hover:bg-slate-100 dark:text-slate-300 dark:hover:bg-slate-800 lg:hidden"
          aria-label="Open navigation menu"
        >
          <FaBars />
        </button>

        <div className="flex items-center gap-2">
          <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-indigo-600 text-lg font-bold text-white">
            B
          </div>

          <span className="hidden text-lg font-bold tracking-tight text-slate-900 dark:text-white sm:block">
            Bug Tracker
          </span>
        </div>
      </div>

      <div className="mx-4 hidden max-w-md flex-1 md:block">
        <div className="flex items-center gap-2 rounded-lg border border-slate-200 bg-slate-50 px-3 transition focus-within:border-indigo-500 focus-within:ring-2 focus-within:ring-indigo-100 dark:border-slate-700 dark:bg-slate-900 dark:focus-within:ring-indigo-900/40">
          <FaSearch className="text-sm text-slate-400" />

          <input
            type="search"
            value={search}
            onChange={handleSearch}
            placeholder="Search issues, projects..."
            className="w-full bg-transparent py-2 text-sm text-slate-800 outline-none placeholder:text-slate-400 dark:text-white"
          />

          <kbd className="hidden rounded border border-slate-200 px-1.5 py-0.5 text-xs text-slate-400 dark:border-slate-700 lg:block">
            /
          </kbd>
        </div>
      </div>

      <div className="relative flex items-center gap-3">
        <div className="relative">
          <button
            type="button"
            onClick={() => setShowUserMenu((prev) => !prev)}
            className="flex items-center gap-2 rounded-lg p-1.5 transition hover:bg-slate-100 dark:hover:bg-slate-800"
            aria-expanded={showUserMenu}
            aria-label="Open user menu"
          >
            <div className="flex h-9 w-9 items-center justify-center rounded-full bg-indigo-100 text-sm font-bold text-indigo-700 dark:bg-indigo-500/20 dark:text-indigo-300">
              {initials || <FaUserCircle />}
            </div>

            <div className="hidden text-left sm:block">
              <p className="max-w-32 truncate text-sm font-semibold text-slate-800 dark:text-white">
                {fullName}
              </p>

              <p className="text-xs capitalize text-slate-500 dark:text-slate-400">
                {user?.role || "Member"}
              </p>
            </div>

            <FaChevronDown className="hidden text-xs text-slate-400 sm:block" />
          </button>

          {showUserMenu && (
            <>
              <button
                type="button"
                aria-label="Close user menu"
                className="fixed inset-0 z-40 cursor-default"
                onClick={() => setShowUserMenu(false)}
              />

              <div className="absolute right-0 z-50 mt-2 w-56 rounded-xl border border-slate-200 bg-white p-2 shadow-xl dark:border-slate-800 dark:bg-slate-900">
                <div className="border-b border-slate-100 px-3 py-2 dark:border-slate-800">
                  <p className="truncate text-sm font-semibold text-slate-800 dark:text-white">
                    {fullName}
                  </p>

                  <p className="truncate text-xs text-slate-500 dark:text-slate-400">
                    {user?.email}
                  </p>
                </div>

                <button
                  type="button"
                  onClick={handleLogout}
                  className="mt-2 flex w-full items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium text-red-600 transition hover:bg-red-50 dark:hover:bg-red-500/10"
                >
                  <FaSignOutAlt />
                  Sign out
                </button>
              </div>
            </>
          )}
        </div>
      </div>
    </header>
  );
}
