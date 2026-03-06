import { useContext } from "react";
import AuthContext from "../../contexts/AuthContext";
import Spinner from "../user_feedback/Spinner";
import ErrorAlert from "../user_feedback/ErrorAlert";
import useStripeEventMonitor from "../../hooks/useStripeEventMonitor";
import StatusEventSummary from "../StripeEventMonitor/StripeEventSummary";
import StripeEventFilters from "../StripeEventMonitor/StripeEventFilters";
import EmptyEventState from "../StripeEventMonitor/EmptyEventState";
import BackToAdminDash from "../UI/BackToAdminDash";
import StripeEventTable from "../StripeEventMonitor/StripeEventTable";
import Pagination from "../StripeEventMonitor/Pagination";

// 🔴 Dead: 12
// 🟡 Failed (3+): 7
// ⏱ 최근 10분 증가: +2

// 필터의 영역 추가 가능:
// order_id 검색, payment_intent_id 검색

// refresh 버튼이 있으면 좋을 것 같음.
// ❌ 에러 메시지 처리가 잘 안 되고 있음.

export default function StripeEventMonitor() {
  const { accessToken } = useContext(AuthContext);
  const {
    events,
    eventTypes,
    isFetchingData,
    isFetchingCount,
    isFetchingEventTypes,
    statusSummary,
    filters,
    eventError,
    eventTypesError,
    eventsCountError,
    setFilters,
    resetFilters,
  } = useStripeEventMonitor(accessToken);

  const errors = [eventError, eventTypesError, eventsCountError].filter(
    Boolean,
  );

  if (isFetchingData || isFetchingCount || isFetchingEventTypes) {
    return <Spinner />;
  }

  if (events.length === 0) {
    return (
      <EmptyEventState
        title="All Stripe events are healthy"
        description="No failed or dead events at the moment."
      />
    );
  }

  return (
    <main className="min-h-screen bg-gray-100 py-10 px-4 sm:px-6">
      <div className="w-full max-w-5xl mx-auto">
        {errors.length > 0 && (
          <div className="mb-4">
            <ErrorAlert
              title="There was a problem"
              message={errors.map((e) => e.message).join(", ")}
            />
          </div>
        )}
        <div className="mb-4">
          <BackToAdminDash />
        </div>

        <section className="bg-white rounded-2xl shadow-lg p-4 sm:p-8">
          <StatusEventSummary statusSummary={statusSummary} />
          <StripeEventFilters
            filters={filters}
            eventTypes={eventTypes}
            onFilterChange={(newFilters) => setFilters(newFilters)}
            onReset={resetFilters}
          />

          <div className="mt-6 overflow-x-auto">
            <StripeEventTable events={events} />
            <Pagination />
          </div>
        </section>
      </div>
    </main>
  );
}
