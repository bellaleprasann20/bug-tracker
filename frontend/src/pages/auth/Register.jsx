
import React, { useState } from "react";
import { Link, Navigate, useNavigate } from "react-router-dom";
import {
  FaBug,
  FaUser,
  FaEnvelope,
  FaLock,
  FaUserPlus,
  FaCheckCircle,
  FaShieldAlt,
} from "react-icons/fa";

import Input from "../../components/common/Input";
import Button from "../../components/common/Button";
import { useAuth } from "../../context/AuthContext";

export default function Register() {
  const {
    register,
    isAuthenticated,
    loading: authLoading,
  } = useAuth();

  const navigate = useNavigate();

  const [form, setForm] = useState({
    full_name: "",
    email: "",
    password: "",
    confirmPassword: "",
  });

  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);

  if (isAuthenticated && !authLoading) {
    return <Navigate to="/dashboard" replace />;
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

    if (!form.full_name.trim()) {
      nextErrors.full_name = "Full name is required.";
    } else if (form.full_name.trim().length < 2) {
      nextErrors.full_name =
        "Name must contain at least 2 characters.";
    }

    if (!form.email.trim()) {
      nextErrors.email = "Email is required.";
    } else if (
      !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email)
    ) {
      nextErrors.email = "Enter a valid email address.";
    }

    if (!form.password) {
      nextErrors.password = "Password is required.";
    } else if (form.password.length < 8) {
      nextErrors.password =
        "Password must contain at least 8 characters.";
    } else if (form.password.length > 128) {
      nextErrors.password =
        "Password cannot exceed 128 characters.";
    }

    if (!form.confirmPassword) {
      nextErrors.confirmPassword =
        "Please confirm your password.";
    } else if (form.password !== form.confirmPassword) {
      nextErrors.confirmPassword =
        "Passwords do not match.";
    }

    setErrors(nextErrors);

    return Object.keys(nextErrors).length === 0;
  };

  const handleSubmit = async (event) => {
    event.preventDefault();

    if (!validate()) return;

    setLoading(true);

    try {
      await register({
        full_name: form.full_name.trim(),
        email: form.email.trim().toLowerCase(),
        password: form.password,
      });

      navigate("/dashboard", { replace: true });
    } catch (error) {
      const detail = error?.response?.data?.detail;

      setErrors({
        general:
          typeof detail === "string"
            ? detail
            : error?.message || "Unable to create your account.",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex min-h-screen bg-slate-50 dark:bg-slate-950">
      {/* Branding panel */}
      <div className="relative hidden w-1/2 flex-col justify-between overflow-hidden bg-gradient-to-br from-indigo-950 via-indigo-900 to-slate-950 p-12 lg:flex">
        <div className="absolute -right-32 -top-32 h-96 w-96 rounded-full bg-indigo-500/20 blur-3xl" />
        <div className="absolute -bottom-32 -left-24 h-96 w-96 rounded-full bg-blue-500/20 blur-3xl" />

        <div className="relative z-10 flex items-center gap-3">
          <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-white/10 text-xl text-white ring-1 ring-white/20">
            <FaBug />
          </div>

          <span className="text-xl font-bold tracking-tight text-white">
            Bug Tracker
          </span>
        </div>

        <div className="relative z-10 max-w-lg">
          <p className="mb-5 text-sm font-semibold tracking-widest text-indigo-300">
            YOUR TEAM WORKSPACE
          </p>

          <h1 className="text-4xl font-bold leading-tight text-white xl:text-5xl">
            Great software starts with
            <span className="text-indigo-300">
              {" "}great collaboration.
            </span>
          </h1>

          <p className="mt-6 max-w-md text-base leading-7 text-indigo-100/75">
            Bring your developers together. Track every issue,
            manage projects, and keep your software delivery
            organized.
          </p>

          <div className="mt-10 grid grid-cols-2 gap-4">
            {[
              "Project management",
              "Issue tracking",
              "Team collaboration",
              "Visual Kanban boards",
            ].map((feature) => (
              <div
                key={feature}
                className="flex items-center gap-2 rounded-xl border border-white/10 bg-white/5 p-3 text-sm text-indigo-100"
              >
                <FaCheckCircle className="shrink-0 text-indigo-300" />
                {feature}
              </div>
            ))}
          </div>
        </div>

        <p className="relative z-10 text-xs text-indigo-200/50">
          © {new Date().getFullYear()} Bug Tracker. All rights reserved.
        </p>
      </div>

      {/* Registration form */}
      <div className="flex flex-1 items-center justify-center px-5 py-10 sm:px-10">
        <div className="w-full max-w-md">
          <div className="mb-7 lg:hidden">
            <div className="flex items-center gap-3">
              <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-indigo-600 text-xl text-white">
                <FaBug />
              </div>

              <span className="text-xl font-bold text-slate-900 dark:text-white">
                Bug Tracker
              </span>
            </div>
          </div>

          <div className="mb-7">
            <p className="text-sm font-semibold text-indigo-600 dark:text-indigo-400">
              GET STARTED
            </p>

            <h2 className="mt-2 text-3xl font-bold text-slate-900 dark:text-white">
              Create your account
            </h2>

            <p className="mt-2 text-sm text-slate-500 dark:text-slate-400">
              Join your team and start managing issues.
            </p>
          </div>

          {errors.general && (
            <div
              role="alert"
              className="mb-5 rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-600 dark:border-red-500/30 dark:bg-red-500/10 dark:text-red-400"
            >
              {errors.general}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <Input
              label="Full name"
              name="full_name"
              value={form.full_name}
              onChange={handleChange}
              placeholder="Enter your full name"
              leftIcon={<FaUser />}
              error={errors.full_name}
              required
              autoComplete="name"
            />

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
              placeholder="Create a password"
              leftIcon={<FaLock />}
              error={errors.password}
              required
              autoComplete="new-password"
            />

            <Input
              label="Confirm password"
              name="confirmPassword"
              type="password"
              value={form.confirmPassword}
              onChange={handleChange}
              placeholder="Enter your password again"
              leftIcon={<FaLock />}
              error={errors.confirmPassword}
              required
              autoComplete="new-password"
            />

            <div className="flex items-start gap-2 rounded-lg bg-slate-100 p-3 dark:bg-slate-900">
              <FaShieldAlt className="mt-0.5 shrink-0 text-indigo-600 dark:text-indigo-400" />

              <p className="text-xs leading-5 text-slate-600 dark:text-slate-400">
                New accounts are registered with the Developer
                role. Project-specific permissions are managed
                by authorized project administrators.
              </p>
            </div>

            <Button
              type="submit"
              fullWidth
              size="lg"
              loading={loading}
              leftIcon={<FaUserPlus />}
            >
              Create Account
            </Button>
          </form>

          <div className="mt-7 text-center">
            <p className="text-sm text-slate-500 dark:text-slate-400">
              Already have an account?{" "}
              <Link
                to="/login"
                className="font-semibold text-indigo-600 hover:text-indigo-700 dark:text-indigo-400"
              >
                Sign in
              </Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
