
import React from "react";
import { Link } from "react-router-dom";
import {
  FaBug,
  FaHome,
  FaArrowLeft,
  FaSearch,
} from "react-icons/fa";

export default function NotFound() {
  return (
    <div className="flex min-h-screen items-center justify-center overflow-hidden bg-slate-50 px-5 py-12 dark:bg-slate-950">
      <div className="relative w-full max-w-xl text-center">
        <div className="pointer-events-none absolute left-1/2 top-1/2 h-80 w-80 -translate-x-1/2 -translate-y-1/2 rounded-full bg-indigo-500/10 blur-3xl" />

        <div className="relative">
          <div className="mx-auto flex h-20 w-20 items-center justify-center rounded-3xl bg-indigo-100 text-4xl text-indigo-600 dark:bg-indigo-500/10 dark:text-indigo-400">
            <FaBug />
          </div>

          <h1 className="mt-8 text-8xl font-black tracking-tight text-indigo-600 dark:text-indigo-400 sm:text-9xl">
            404
          </h1>

          <h2 className="mt-4 text-2xl font-bold text-slate-900 dark:text-white">
            Oops! Page not found
          </h2>

          <p className="mx-auto mt-3 max-w-md text-sm leading-7 text-slate-500 dark:text-slate-400">
            The page you're looking for doesn't exist, may have
            been moved, or the URL might be incorrect.
          </p>

          <div className="mt-8 flex flex-col justify-center gap-3 sm:flex-row">
            <Link
              to="/dashboard"
              className="inline-flex items-center justify-center gap-2 rounded-xl bg-indigo-600 px-6 py-3 text-sm font-semibold text-white transition hover:bg-indigo-700"
            >
              <FaHome />
              Go to Dashboard
            </Link>

            <button
              type="button"
              onClick={() => window.history.back()}
              className="inline-flex items-center justify-center gap-2 rounded-xl border border-slate-200 bg-white px-6 py-3 text-sm font-semibold text-slate-700 transition hover:bg-slate-50 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-200 dark:hover:bg-slate-800"
            >
              <FaArrowLeft />
              Go Back
            </button>
          </div>

          <div className="mt-10 flex items-center justify-center gap-2 text-xs text-slate-400">
            <FaSearch />
            Check the URL and try again.
          </div>

          <p className="mt-8 text-xs text-slate-400">
            Bug Tracker · Error 404
          </p>
        </div>
      </div>
    </div>
  );
}
