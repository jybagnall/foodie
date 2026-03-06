import { useState, useMemo } from "react";
import { useQuery, useQueryClient, useMutation } from "@tanstack/react-query";
import { useSearchParams } from "react-router-dom";
import StripeService from "../services/stripe.service";
import { getTimeRangeStart } from "../utils/format";
import { queryKeys } from "../constants/queryKeys";

const initialFilters = {
  event_type: null,
  status: null,
  timeRange: null,
};

export default function useStripeEventMonitor(accessToken) {
  const stripeService = useMemo(() => {
    return new StripeService(() => accessToken);
  }, [accessToken]);

  const [searchParams, setSearchParams] = useSearchParams();
  const [filters, setFilters] = useState(initialFilters);

  const pageParam = searchParams.get("page");

  const currentPage =
    pageParam && !isNaN(Number(pageParam)) ? Number(pageParam) : 1;

  const queryClient = useQueryClient();

  const { mutate: confirmDeadEvents } = useMutation({
    mutationFn: (time) => stripeService.markStripeEventsAsNotified(time),
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: [queryKeys.stripeDeadCounts],
      });
    },
  });

  const {
    data: { data: events = [], totalMatchingEvents = 0, totalPages = 0 } = {},
    error: eventError,
    isFetching: isFetchingData,
  } = useQuery({
    queryKey: [
      queryKeys.stripeEvents,
      filters.event_type,
      filters.status,
      filters.timeRange,
      currentPage,
    ],
    queryFn: () =>
      stripeService.getErroredStripeEvents({
        event_type: filters.event_type,
        status: filters.status,
        created_from: getTimeRangeStart(filters.timeRange),
        page: currentPage,
      }),
    keepPreviousData: true, // 페이지 이동시 데이터 증발 방지.
    staleTime: 0,
    refetchInterval: 5000,
    enabled: !!accessToken,
  });

  const {
    data: eventTypes = [],
    isLoading: isFetchingEventTypes,
    error: eventTypesError,
  } = useQuery({
    queryKey: [queryKeys.stripeEventTypes],
    queryFn: () => stripeService.getEventTypes(),
    staleTime: 1000 * 60 * 10,
    enabled: !!accessToken,
  });

  const {
    data: statusSummary = { failedCount: 0, deadCount: 0 },
    isLoading: isFetchingCount,
    error: eventsCountError,
  } = useQuery({
    queryKey: [
      queryKeys.stripeErroredCounts,
      filters.event_type,
      filters.status,
      filters.timeRange,
    ],
    queryFn: () => stripeService.getErroredStripeEventsCount(),
    keepPreviousData: true,
    staleTime: 0,
    refetchInterval: 5000,
    enabled: !!accessToken,
  });

  const {
    data: deadSummary = { count: 0, lastSeenTime: null },
    isLoading: isFetchingDeadCount,
    error: deadEventsCountError,
  } = useQuery({
    queryKey: [queryKeys.stripeDeadCounts],
    queryFn: () => stripeService.getStripeDeadEventsCount(),
    staleTime: 0,
    refetchInterval: 30000,
    enabled: !!accessToken,
  });

  const resetFilters = () => {
    setFilters(initialFilters);

    const params = new URLSearchParams(searchParams);
    params.set("page", "1");
    setSearchParams(params);
  };

  return {
    events,
    eventTypes,
    statusSummary,
    filters,
    totalMatchingEvents,
    totalPages,
    currentPage,
    deadSummary,
    isFetchingData,
    isFetchingCount,
    isFetchingEventTypes,
    isFetchingDeadCount,
    setFilters,
    resetFilters,
    confirmDeadEvents,
    eventError,
    eventTypesError,
    eventsCountError,
    deadEventsCountError,
  };
}
