// React Hook Form 전용

import { ChevronDownIcon } from "@heroicons/react/24/outline";

const selectStyle =
  "col-start-1 row-start-1 w-full appearance-none rounded-md bg-gray-700 py-1.5 pr-8 pl-3 text-base text-gray-200 outline-1 -outline-offset-1 outline-gray-300 focus-visible:outline-2 focus-visible:-outline-offset-2 focus-visible:outline-indigo-600 sm:text-sm/6";

export default function Select({
  id,
  label,
  register,
  error,
  options,
  placeholder = "Select an option",
}) {
  return (
    <div className="flex flex-col gap-1">
      <label
        htmlFor={id}
        className="text-sm font-medium text-gray-300 tracking-wide"
      >
        {label}
      </label>

      <div className="mt-1 grid grid-cols-1">
        <select
          id={id}
          {...register}
          className={`${selectStyle} 
          ${
            error
              ? "border-red-500 focus:ring-2 focus:ring-red-400"
              : "border-gray-300 focus:ring-2 focus:ring-yellow-400 focus:border-yellow-400"
          }`}
        >
          <option value="">{placeholder}</option>
          {options.map((opt) => (
            <option key={opt.value} value={opt.value}>
              {opt.value}
            </option>
          ))}
        </select>

        <ChevronDownIcon
          aria-hidden="true"
          className="pointer-events-none col-start-1 row-start-1 mr-2 size-5 self-center justify-self-end text-gray-200 sm:size-4"
        />
      </div>

      {error && (
        <span className="text-sm text-red-500 mt-1">
          {error.message || "This field is required"}
        </span>
      )}
    </div>
  );
}
