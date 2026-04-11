import { useState } from "react";
import Spinner from "../user_feedback/Spinner";
import ErrorAlert from "../user_feedback/ErrorAlert";
import useStripeEventMonitor from "../../hooks/useStripeEventMonitor";
import StatusEventSummary from "../StripeEventMonitor/StripeEventSummary";
import StripeEventFilters from "../StripeEventMonitor/StripeEventFilters";
import EmptyEventState from "../StripeEventMonitor/EmptyEventState";
import BackToDash from "../UI/BackToDash";
import StripeEventTable from "../StripeEventMonitor/StripeEventTable";
import Pagination from "../StripeEventMonitor/Pagination";
import { useSearchParams } from "react-router-dom";

// 🔴 Dead: 12
// 🟡 Failed (3+): 7
// ⏱ 최근 10분 증가: +2

// 필터의 영역 추가 가능:
// order_id 검색, payment_intent_id 검색

// URL = single source of truth
export default function StripeEventMonitor() {
  const [searchParams, setSearchParams] = useSearchParams();

  const {
    events,
    eventTypes,
    statusSummary,
    filters,
    currentPage,
    totalMatchingEvents,
    totalPages,
    pageLimit,
    isFetchingData,
    isFetchingCount,
    isFetchingEventTypes,
    eventError,
    eventTypesError,
    eventsCountError,
  } = useStripeEventMonitor();

  // UI 입력 상태 변경 시 url 업데이트
  const initialFilters = {
    event_type: searchParams.get("event_type") ?? "",
    status: searchParams.get("status") ?? "",
    timeRange: searchParams.get("timeRange") ?? "",
  };

  const [draftFilters, setDraftFilters] = useState(initialFilters);

  const updateDraftFilter = (key, value) => {
    setDraftFilters((prev) => ({
      ...prev,
      [key]: value,
    }));
  };

  const applyFilters = () => {
    setSearchParams((prev) => {
      const params = new URLSearchParams(prev);

      Object.entries(draftFilters).forEach(([key, value]) => {
        if (value) params.set(key, value);
        else params.delete(key);
      });

      params.set("page", "1");
      return params;
    });
  };

  // 기존 query params 지우고 page만 수정
  // `/admin/events-monitor?page=1`
  const resetFilters = () => {
    setDraftFilters({
      event_type: "",
      status: "",
      timeRange: "",
    });

    const params = new URLSearchParams();
    params.set("page", "1");
    setSearchParams(params);
  };

  const errors = [eventError, eventTypesError, eventsCountError].filter(
    Boolean,
  );
  const isFiltered = filters.event_type || filters.status || filters.timeRange;

  if (isFetchingData || isFetchingCount || isFetchingEventTypes) {
    return <Spinner />;
  }

  if (totalMatchingEvents === 0 && !isFiltered) {
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
          <BackToDash
            url="/admin"
            dashboardName="Back to admin dashboard"
            title="Send invite"
          />
        </div>

        <section className="bg-white rounded-2xl shadow-lg p-4 sm:p-8">
          <StatusEventSummary statusSummary={statusSummary} />
          <StripeEventFilters
            draftFilters={draftFilters}
            filters={filters}
            eventTypes={eventTypes}
            updateDraftFilter={updateDraftFilter}
            applyFilters={applyFilters}
            onReset={resetFilters}
          />

          <div className="mt-6 overflow-x-auto">
            {totalMatchingEvents === 0 ? (
              <EmptyEventState
                title="No results found"
                description="No results found for the selected filters."
              />
            ) : (
              <StripeEventTable events={events} />
            )}
            <Pagination
              currentPage={currentPage}
              totalPages={totalPages}
              pageLimit={pageLimit}
              totalMatchingEvents={totalMatchingEvents}
            />
          </div>
        </section>
      </div>
    </main>
  );
}
