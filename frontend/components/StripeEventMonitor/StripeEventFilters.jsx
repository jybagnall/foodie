import { ChevronDownIcon } from "@heroicons/react/16/solid";

const timeRange = ["30m", "1h", "3h", "6h", "12h", "24h"];
const selectStyle =
  "col-start-1 row-start-1 w-full appearance-none rounded-md bg-white py-1.5 pr-8 pl-3 text-base text-gray-900 outline-1 -outline-offset-1 outline-gray-300 focus-visible:outline-2 focus-visible:-outline-offset-2 focus-visible:outline-indigo-600 sm:text-sm/6";

export default function StripeEventFilters({
  filters,
  eventTypes,
  onFilterChange,
  onReset,
}) {
  return (
    <div className="bg-white shadow-md rounded-xl p-4 mb-6 flex flex-wrap gap-4 items-end">
      {/* Event Type */}
      <div className="flex flex-col">
        <label
          htmlFor="event type"
          className="block text-sm/6 font-medium text-gray-900"
        >
          Event Type
        </label>

        <div className="mt-2 grid grid-cols-1">
          <select
            disabled={eventTypes.length === 0}
            value={filters.event_type || ""}
            // onChange={(e) => handleChange("event_type", e.target.value)}
            defaultValue="--"
            className={selectStyle}
          >
            {eventTypes.map((type) => (
              <option key={type} value={type}>
                {type}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Status */}
      <div className="flex flex-col">
        <label
          htmlFor="event status"
          className="block text-sm/6 font-medium text-gray-900"
        >
          Event Status
        </label>

        <div className="mt-2 grid grid-cols-1">
          <select
            value={filters.status || ""}
            // onChange={(e) => handleChange("event_type", e.target.value)}
            defaultValue="failed"
            className={selectStyle}
          >
            <option value="failed">Failed</option>
            <option value="dead">Dead</option>
          </select>
        </div>
      </div>

      {/* Time Range */}
      <div className="flex flex-col">
        <label
          htmlFor="time range"
          className="block text-sm/6 font-medium text-gray-900"
        >
          Time Range
        </label>

        <div className="mt-2 grid grid-cols-1">
          <select
            value={filters.timeRange || ""}
            // onChange={(e) => handleChange("event_type", e.target.value)}
            defaultValue="30m"
            className={selectStyle}
          >
            {timeRange.map((time) => (
              <option key={time} value={time}>
                {time}
              </option>
            ))}
          </select>
        </div>
      </div>

      <button
        onClick={onReset}
        className="ml-auto bg-gray-200 hover:bg-gray-300 px-4 py-2 rounded-md text-sm"
      >
        Reset
      </button>
    </div>
  );
}
