
import React from "react";
import {
  FaSearch,
  FaTimes,
} from "react-icons/fa";

export default function SearchBar({
  value,
  onChange,
  placeholder = "Search...",
  className = "",
  onClear,
}) {
  const handleClear = () => {
    onChange?.({ target: { value: "" } });
    onClear?.();
  };

  return (
    <div
      className={`
        flex w-full items-center gap-2 rounded-lg
        border border-slate-200 bg-white px-3
        transition-all
        focus-within:border-indigo-500
        focus-within:ring-2 focus-within:ring-indigo-100
        dark:border-slate-700 dark:bg-slate-900
        dark:focus-within:ring-indigo-900/40
        ${className}
      `}
    >
      <FaSearch className="shrink-0 text-sm text-slate-400" />

      <input
        type="search"
        value={value}
        onChange={onChange}
        placeholder={placeholder}
        className="min-w-0 flex-1 bg-transparent py-2.5 text-sm text-slate-800 outline-none placeholder:text-slate-400 dark:text-white"
      />

      {value && (
        <button
          type="button"
          onClick={handleClear}
          className="shrink-0 rounded p-1 text-slate-400 hover:text-slate-700 dark:hover:text-white"
          aria-label="Clear search"
        >
          <FaTimes />
        </button>
      )}
    </div>
  );
}
