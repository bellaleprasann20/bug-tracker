
import React, { useState } from "react";
import { Link, Navigate, useLocation, useNavigate } from "react-router-dom";
import {
  FaBug,
  FaEnvelope,
  FaLock,
  FaArrowRight,
  FaShieldAlt,
  FaCheckCircle,
} from "react-icons/fa";

import Input from "../../components/common/Input";
import Button from "../../components/common/Button";
import { useAuth } from "../../context/AuthContext";

export default function Login() {
  const { login, isAuthenticated, loading: authLoading } = useAuth();

  const navigate = useNavigate();
  const location = useLocation();

  const [form, setForm] = useState({
    email: "",
    password: "",
  });

  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);

  const redirectTo = location.state?.from?.pathname || "/dashboard";

  if (isAuthenticated && !authLoading) {
    return <Navigate to={redirectTo} replace />;
  }

  const handleChange = (event) => {
    const { name, value } = event.target;

    setForm((previous) => ({
      ...previous,
      [name]: value,
    }));

    setErrors((previous) => ({
      ...previous,
      [name]: "",
      general: "",
    }));
  };

  const validate = () => {
    const nextErrors = {};

    if (!form.email.trim()) {
      nextErrors.email = "Email is required.";
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email)) {
      nextErrors.email = "Enter a valid email address.";
    }

    if (!form.password) {
      nextErrors.password = "Password is required.";
    }

    setErrors(nextErrors);
    return Object.keys(nextErrors).length === 0;
  };

  const handleSubmit = async (event) => {
    event.preventDefault();

    if (!validate()) return;

    setLoading(true);

    try {
      await login({
        email: form.email.trim().toLowerCase(),
        password: form.password,
      });

      navigate(redirectTo, { replace: true });
    } catch (error) {
      const detail = error?.response?.data?.detail;

      setErrors({
        general:
          typeof detail === "string"
            ? detail
            : Array.isArray(detail)
              ? detail.map((item) => item.msg).join(", ")
              : "Unable to sign in. Check your credentials and try again.",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="auth-page flex min-h-screen bg-slate-950 text-white">
      {/* Branding panel */}
      <section className="relative hidden min-h-screen w-1/2 flex-col justify-between overflow-hidden bg-gradient-to-br from-indigo-950 via-slate-900 to-slate-950 p-12 lg:flex xl:p-16">
        <div className="pointer-events-none absolute -right-32 -top-32 h-96 w-96 rounded-full bg-indigo-500/20 blur-3xl" />
        <div className="pointer-events-none absolute -bottom-32 -left-24 h-96 w-96 rounded-full bg-blue-500/20 blur-3xl" />

        <div className="relative z-10 flex items-center gap-3">
          <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-indigo-500 text-xl text-white shadow-lg shadow-indigo-950/40">
            <FaBug />
          </div>
          <span className="text-2xl font-bold tracking-tight">
            Bug Tracker
          </span>
        </div>

        <div className="relative z-10 max-w-xl">
          <div className="mb-7 inline-flex items-center gap-2 rounded-full border border-indigo-400/20 bg-indigo-400/10 px-4 py-2 text-sm font-medium text-indigo-200">
            <FaShieldAlt />
            Smart issue management
          </div>

          <h1 className="text-4xl font-bold leading-tight text-white xl:text-6xl">
            Build better software,
            <span className="block text-indigo-300">
              together.
            </span>
          </h1>

          <p className="mt-6 max-w-lg text-base leading-8 text-slate-300 xl:text-lg">
            Organize projects, track bugs, collaborate with your team,
            and deliver quality software from one workspace.
          </p>

          <div className="mt-10 space-y-5">
            {[
              "Manage projects and development tasks",
              "Track issues with a visual Kanban board",
              "Collaborate with threaded team discussions",
            ].map((item) => (
              <div
                key={item}
                className="flex items-center gap-3 text-sm text-slate-200 xl:text-base"
              >
                <FaCheckCircle className="shrink-0 text-indigo-300" />
                {item}
              </div>
            ))}
          </div>
        </div>

        <p className="relative z-10 text-sm text-slate-500">
          © {new Date().getFullYear()} Bug Tracker. All rights reserved.
        </p>
      </section>

      {/* Login section */}
      <section className="flex min-h-screen flex-1 items-center justify-center px-5 py-10 sm:px-10 lg:px-12">
        <div className="w-full max-w-md">
          {/* Mobile branding */}
          <div className="mb-12 flex items-center justify-center gap-3 lg:hidden">
            <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-indigo-600 text-xl shadow-lg shadow-indigo-950/40">
              <FaBug />
            </div>
            <span className="text-2xl font-bold">Bug Tracker</span>
          </div>

          <div className="mb-9">
            <p className="text-sm font-bold tracking-widest text-indigo-400">
              WELCOME BACK
            </p>

            <h2 className="mt-3 text-3xl font-bold tracking-tight text-white sm:text-4xl">
              Sign in to your account
            </h2>

            <p className="mt-3 text-sm leading-6 text-slate-400">
              Enter your credentials to access your workspace.
            </p>
          </div>

          {errors.general && (
            <div
              role="alert"
              className="mb-6 rounded-xl border border-red-500/30 bg-red-500/10 px-4 py-3 text-sm leading-6 text-red-300"
            >
              {errors.general}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-6">
            <Input
              label="Email address"
              name="email"
              type="email"
              value={form.email}
              onChange={handleChange}
              placeholder="you@example.com"
              leftIcon={<FaEnvelope />}
              error={errors.email}
              required
              autoComplete="email"
            />

            <Input
              label="Password"
              name="password"
              type="password"
              value={form.password}
              onChange={handleChange}
              placeholder="Enter your password"
              leftIcon={<FaLock />}
              error={errors.password}
              required
              autoComplete="current-password"
            />

            <Button
              type="submit"
              fullWidth
              size="lg"
              loading={loading}
              rightIcon={<FaArrowRight />}
            >
              Sign In
            </Button>
          </form>

          <div className="mt-8 text-center">
            <p className="text-sm text-slate-400">
              Don't have an account?{" "}
              <Link
                to="/register"
                className="font-semibold text-indigo-400 transition hover:text-indigo-300"
              >
                Create account
              </Link>
            </p>
          </div>

          <div className="mt-10 flex items-center justify-center gap-2 text-xs text-slate-500">
            <FaShieldAlt className="shrink-0" />
            Your account is protected with secure authentication.
          </div>
        </div>
      </section>
    </main>
  );
}
