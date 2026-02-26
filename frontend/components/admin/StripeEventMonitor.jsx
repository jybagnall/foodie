import { useContext } from "react";
import AuthContext from "../../contexts/AuthContext";
import Button from "../UI/Button";
import Spinner from "../user_feedback/Spinner";
import ErrorAlert from "../user_feedback/ErrorAlert";
import useStripeEventMonitor from "../../hooks/useStripeEventMonitor";
import StatusEventSummary from "../StripeEventMonitor/StripeEventSummary";
import StripeEventFilters from "../StripeEventMonitor/StripeEventFilters";
import EmptyEventState from "../StripeEventMonitor/EmptyEventState";
import BackToAdminDash from "../UI/BackToAdminDash";

// 🔴 Dead: 12
// 🟡 Failed (3+): 7
// ⏱ 최근 10분 증가: +2

// 필터의 영역:
// 시간 유형별 (최근 1시간 / 6시간 / 24시간), event_type 드롭다운, 상태 (dead / failed), order_id 검색, payment_intent_id 검색

const columns = [
  { key: "id", label: "ID" },
  { key: "event_type", label: "Event Type" },
  { key: "status", label: "Status" },
  { key: "retry_count", label: "Retry Count" },
  { key: "last_error", label: "Last Error" },
  { key: "created_at", label: "Created At" },
  // { key: "", label: "Actions" },
];

const thClass = "py-3.5 px-3 text-left text-sm font-semibold text-gray-900";
const tdClass = "px-3 py-4 text-sm whitespace-nowrap text-gray-900";

// refresh 버튼이 있으면 좋을 것 같음.
// 에러 메시지를 보여줘야함
export default function StripeEventMonitor() {
  const { accessToken } = useContext(AuthContext);
  const {
    events,
    eventTypes,
    pageNum,
    isFetchingData,
    isFetchingCount,
    isFetchingEventTypes,
    totalMatchingEvents,
    statusSummary,
    totalPages,
    filters,
    errorMsg,
    fetchEvents,
    setFilters,
    resetFilters,
  } = useStripeEventMonitor(accessToken);

  if (isFetchingData || isFetchingCount || isFetchingEventTypes) {
    return <Spinner />;
  }

  if (events.length === 0) {
    return (
      <EmptyState
        title="All Stripe events are healthy"
        description="No failed or dead events at the moment."
      />
    );
  }

  return (
    <main className="min-h-screen flex justify-center items-start bg-gray-50 py-20 px-4">
      <div className="w-full max-w-lg">
        {errorMsg && (
          <div className="mb-4">
            <ErrorAlert title="There was a problem" message={errorMsg} />
          </div>
        )}
        <div className="mb-4">
          <BackToAdminDash />
        </div>

        <Pagination
          pageNum={pageNum}
          totalPages={totalPages}
          totalMatchingEvents={totalMatchingEvents}
          onPageChange={(page) => fetchEvents(page)}
        />

        <section className="w-full max-w-lg bg-white shadow-xl rounded-xl p-8">
          <StatusEventSummary statusSummary={statusSummary} />
          <StripeEventFilters
            filters={filters}
            eventTypes={eventTypes}
            onFilterChange={(newFilters) => setFilters(newFilters)}
            onReset={resetFilters}
          />

          <table className="relative min-w-full divide-y divide-gray-300">
            <thead>
              <tr>
                {columns.map((col) => (
                  <th key={col.key} scope="col" className={thClass}>
                    {col.label}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {events.map((e) => (
                <tr key={e.id}>
                  {columns.map((col) => (
                    <td key={col.key} className={tdClass}>
                      {e[col.key]}
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>

          <div className="mt-8">
            <Button
              type="submit"
              propStyle="py-1 px-3 bg-blue-600 hover:bg-blue-700 text-white"
            >
              ?
            </Button>
          </div>
        </section>
      </div>
    </main>
  );
}
