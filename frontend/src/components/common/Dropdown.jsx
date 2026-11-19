
import React from "react";
import { FaChevronDown } from "react-icons/fa";

export default function Dropdown({
  label,
  name,
  value,
  onChange,
  options = [],
  placeholder = "Select an option",
  error,
  disabled = false,
  required = false,
  className = "",
}) {
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

      <div className="relative">
        <select
          id={name}
          name={name}
          value={value}
          onChange={onChange}
          disabled={disabled}
          required={required}
          className={`
            w-full appearance-none rounded-lg border
            bg-white px-3 py-2.5 pr-10 text-sm
            text-slate-800 outline-none
            transition-all
            focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100
            disabled:cursor-not-allowed disabled:opacity-60
            dark:border-slate-700 dark:bg-slate-900
            dark:text-white dark:focus:ring-indigo-900/40
            ${
              error
                ? "border-red-500"
                : "border-slate-300"
            }
            ${className}
          `}
        >
          <option value="">{placeholder}</option>

          {options.map((option) => {
            const item =
              typeof option === "string"
                ? { label: option, value: option }
                : option;

            return (
              <option
                key={item.value}
                value={item.value}
                disabled={item.disabled}
              >
                {item.label}
              </option>
            );
          })}
        </select>

        <FaChevronDown className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-xs text-slate-400" />
      </div>

      {error && (
        <p className="text-xs text-red-500">{error}</p>
      )}
    </div>
  );
}
