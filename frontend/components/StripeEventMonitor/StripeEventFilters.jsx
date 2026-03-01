import SelectFilter from "../UI/SelectFilter";

const timeRange = ["30m", "1h", "3h", "6h", "12h", "24h"];

export default function StripeEventFilters({
  filters,
  eventTypes,
  onFilterChange,
  onReset,
  fetchEvents,
}) {
  const handleChange = (key, value) => {
    onFilterChange({ ...filters, [key]: value });
  };

  return (
    <div className="mt-6 bg-gray-50 rounded-xl p-4 sm:p-6 w-full flex flex-col">
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
        <SelectFilter
          label="Event Type"
          value={filters.event_type}
          onChange={(e) => handleChange("event_type", e.target.value)}
          options={eventTypes}
        />
        <SelectFilter
          label="Event Status"
          value={filters.status}
          onChange={(e) => handleChange("status", e.target.value)}
          options={["failed", "dead"]}
        />
        <SelectFilter
          label="Time Range"
          value={filters.timeRange}
          onChange={(e) => handleChange("timeRange", e.target.value)}
          options={timeRange}
        />
      </div>

      <div className="mt-4 flex gap-3 w-full lg:justify-end">
        <button
          onClick={() => fetchEvents(1)}
          className="w-full sm:w-auto bg-gray-900 text-white px-4 py-2 rounded-md text-sm"
        >
          Apply
        </button>
        <button
          onClick={onReset}
          className="w-full sm:w-auto bg-gray-200 px-4 py-2 rounded-md text-sm"
        >
          Reset
        </button>
      </div>
    </div>
  );
}
