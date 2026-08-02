import { useEffect, useMemo } from "react";
import { useSearchParams } from "react-router-dom";
import { useQueryClient } from "@tanstack/react-query";
import { stripeKeys } from "../../react-query/queryKeys";
import { getTimeRangeStart } from "../../utils/format";
import StripeService from "../../services/stripe.service";
import useAccessToken from "../auth/useAccessToken";
import useStripeDeadSummary from "./useStripeDeadSummary";
import useStripeEventTypes from "./useStripeEventTypes";
import useStripeErroredEvents from "./useStripeErroredEvents";
import useStripeErroredEventCounts from "./useStripeErroredEventCounts";
import useAcknowledgeStripeEvents from "./useAcknowledgeStripeEvents";

// polling이 있으면 stale 여부가 중요하지 않음 (staleTime: 0)

export default function useStripeEventMonitor() {
  const [searchParams] = useSearchParams();
  const queryClient = useQueryClient();
  const accessToken = useAccessToken();

  const pageParam = searchParams.get("page");

  const currentPage =
    pageParam && !isNaN(Number(pageParam)) ? Number(pageParam) : 1;

  const filters = useMemo(
    () => ({
      event_type: searchParams.get("event_type"),
      status: searchParams.get("status"),
      timeRange: searchParams.get("timeRange"),
    }),
    [searchParams],
  ); // 불필요한 refetch 방지

  const {
    events,
    totalMatchingEvents,
    totalPages,
    pageLimit,
    eventError,
    isFetchingData,
  } = useStripeErroredEvents(filters, currentPage);

  const { eventTypes, isFetchingEventTypes, eventTypesError } =
    useStripeEventTypes(filters);

  const { deadSummary, isFetchingDeadCount, deadEventsCountError } =
    useStripeDeadSummary();

  const { erroredEventCounts, isFetchingCount, eventsCountError } =
    useStripeErroredEventCounts(filters);

  const { acknowledgeDeadEvents } = useAcknowledgeStripeEvents();

  useEffect(() => {
    if (currentPage >= totalPages) return;

    const nextPage = currentPage + 1;

    queryClient.prefetchQuery({
      queryKey: stripeKeys.events(
        filters.event_type,
        filters.status,
        filters.timeRange,
        nextPage,
      ),
      queryFn: ({ signal }) =>
        new StripeService(signal, () => accessToken).getErroredStripeEvents({
          event_type: filters.event_type,
          status: filters.status,
          created_from: getTimeRangeStart(filters.timeRange),
          page: nextPage,
        }),
      staleTime: 1000 * 30, // 30초 동안 fresh 상태로 캐시에 저장
    });
  }, [
    queryClient,
    currentPage,
    totalPages,
    filters.event_type,
    filters.status,
    filters.timeRange,
  ]);

  return {
    events,
    eventTypes,
    erroredEventCounts,
    filters,
    totalMatchingEvents,
    totalPages,
    pageLimit,
    currentPage,
    deadSummary,
    acknowledgeDeadEvents,
    isFetchingData,
    isFetchingCount,
    isFetchingEventTypes,
    isFetchingDeadCount,
    eventError,
    eventTypesError,
    eventsCountError,
    deadEventsCountError,
  };
}
