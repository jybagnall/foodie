import SelectFilter from "../UI/SelectFilter";

const timeRange = ["30m", "1h", "3h", "6h", "12h", "24h"];

export default function StripeEventFilters({
  draftFilters,
  filters,
  eventTypes,
  updateDraftFilter,
  onReset,
  applyFilters,
}) {
  // filters 객체의 값 중에 null 존재 가능. null이면 ""로 치환
  // 현재 UI 필터가 URL 필터와 다른가?
  const filtersChanged =
    draftFilters.event_type !== (filters.event_type ?? "") ||
    draftFilters.status !== (filters.status ?? "") ||
    draftFilters.timeRange !== (filters.timeRange ?? "");

  return (
    <div className="mt-6 bg-gray-50 rounded-xl p-4 sm:p-6 w-full flex flex-col">
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
        <SelectFilter
          id="event_type"
          label="Event Type"
          value={draftFilters.event_type}
          onChange={(e) => updateDraftFilter("event_type", e.target.value)}
          options={eventTypes ?? []}
        />
        <SelectFilter
          id="status"
          label="Event Status"
          value={draftFilters.status}
          onChange={(e) => updateDraftFilter("status", e.target.value)}
          options={["failed", "dead"]}
        />
        <SelectFilter
          id="timeRange"
          label="Time Range"
          value={draftFilters.timeRange}
          onChange={(e) => updateDraftFilter("timeRange", e.target.value)}
          options={timeRange}
        />
      </div>

      <div className="mt-4 flex gap-3 w-full lg:justify-end">
        <button
          onClick={() => applyFilters()}
          disabled={!filtersChanged}
          className={`w-full sm:w-auto text-white px-4 py-2 rounded-md text-sm ${
            filtersChanged
              ? "bg-gray-700 hover:bg-gray-500 cursor-pointer"
              : "bg-gray-400 cursor-not-allowed"
          }`}
        >
          Apply
        </button>
        <button
          onClick={onReset}
          disabled={!filtersChanged}
          className={`w-full sm:w-auto text-white px-4 py-2 rounded-md text-sm ${
            filtersChanged
              ? "bg-gray-700 hover:bg-gray-500 cursor-pointer"
              : "bg-gray-400 cursor-not-allowed"
          }`}
        >
          Reset
        </button>
      </div>
    </div>
  );
}
// 버튼 스타일 바꿀 것
