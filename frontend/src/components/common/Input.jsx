
import React, { useState } from "react";
import { FaEye, FaEyeSlash } from "react-icons/fa";

export default function Input({
  label,
  name,
  type = "text",
  placeholder = "",
  value,
  onChange,
  error,
  required = false,
  disabled = false,
  leftIcon = null,
  rightIcon = null,
  className = "",
  ...props
}) {
  const [showPassword, setShowPassword] = useState(false);

  const isPassword = type === "password";
  const inputType =
    isPassword && showPassword ? "text" : type;

  return (
    <div className="w-full space-y-1.5">
      {label && (
        <label
          htmlFor={name}
          className="block text-sm font-medium text-slate-700 dark:text-slate-300"
        >
          {label}
          {required && (
            <span className="ml-1 text-red-500">*</span>
          )}
        </label>
      )}

      <div
        className={`
          flex items-center gap-2 rounded-lg border
          bg-white px-3 transition-all
          dark:bg-slate-900
          ${
            error
              ? "border-red-500 focus-within:ring-2 focus-within:ring-red-100"
              : "border-slate-300 focus-within:border-indigo-500 focus-within:ring-2 focus-within:ring-indigo-100 dark:border-slate-700 dark:focus-within:ring-indigo-900/40"
          }
          ${disabled ? "cursor-not-allowed opacity-60" : ""}
        `}
      >
        {leftIcon && (
          <span className="shrink-0 text-slate-400">
            {leftIcon}
          </span>
        )}

        <input
          id={name}
          name={name}
          type={inputType}
          placeholder={placeholder}
          value={value}
          onChange={onChange}
          required={required}
          disabled={disabled}
          className={`
            min-w-0 flex-1 bg-transparent py-2.5
            text-sm text-slate-900 outline-none
            placeholder:text-slate-400
            dark:text-white
            disabled:cursor-not-allowed
            ${className}
          `}
          {...props}
        />

        {isPassword ? (
          <button
            type="button"
            onClick={() => setShowPassword((prev) => !prev)}
            className="shrink-0 text-slate-400 hover:text-slate-700 dark:hover:text-slate-200"
            aria-label={
              showPassword ? "Hide password" : "Show password"
            }
          >
            {showPassword ? <FaEyeSlash /> : <FaEye />}
          </button>
        ) : (
          rightIcon
        )}
      </div>

      {error && (
        <p className="text-xs text-red-500">{error}</p>
      )}
    </div>
  );
}
