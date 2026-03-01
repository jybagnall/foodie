import { ChevronDownIcon } from "@heroicons/react/24/outline";

const selectStyle =
  "col-start-1 row-start-1 w-full appearance-none rounded-md bg-white py-1.5 pr-8 pl-3 text-base text-gray-900 outline-1 -outline-offset-1 outline-gray-300 focus-visible:outline-2 focus-visible:-outline-offset-2 focus-visible:outline-indigo-600 sm:text-sm/6";

export default function SelectFilter({ label, value, onChange, options }) {
  return (
    <div className="flex flex-col">
      <label
        htmlFor={label}
        className="block text-sm/6 font-medium text-gray-900"
      >
        {label}
      </label>

      <div className="mt-2 grid grid-cols-1">
        <select value={value} onChange={onChange} className={selectStyle}>
          <option value="">All</option>
          {options.map((opt) => (
            <option key={opt} value={opt}>
              {opt}
            </option>
          ))}
        </select>
        <ChevronDownIcon
          aria-hidden="true"
          className="pointer-events-none col-start-1 row-start-1 mr-2 size-5 self-center justify-self-end text-gray-500 sm:size-4"
        />
      </div>
    </div>
  );
}
