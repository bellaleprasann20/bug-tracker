
import React from "react";
import { FaSpinner } from "react-icons/fa";

export default function Loader({
  message = "Loading...",
  fullScreen = false,
  size = "md",
}) {
  const sizes = {
    sm: "text-lg",
    md: "text-3xl",
    lg: "text-5xl",
  };

  return (
    <div
      className={`
        flex flex-col items-center justify-center gap-3
        ${fullScreen ? "min-h-screen" : "min-h-40 w-full"}
      `}
    >
      <FaSpinner
        className={`animate-spin text-indigo-600 ${
          sizes[size] || sizes.md
        }`}
      />

      {message && (
        <p className="text-sm font-medium text-slate-500 dark:text-slate-400">
          {message}
        </p>
      )}
    </div>
  );
}
