import { useEffect, useMemo } from "react";
import { useSearchParams } from "react-router-dom";
import {
  useQuery,
  useQueryClient,
  useMutation,
  keepPreviousData,
} from "@tanstack/react-query";
import StripeService from "../services/stripe.service";
import { getTimeRangeStart } from "../utils/format";
import { stripeKeys } from "../react-query/queryKeys";
import { POLLING_30S, adaptivePolling } from "../react-query/queryConfig";
import useAccessToken from "../hooks/useAccessToken"

// polling이 있으면 stale 여부가 중요하지 않음 (staleTime: 0)

export default function useStripeEventMonitor() {
const accessToken = useAccessToken();
  const [searchParams] = useSearchParams();
  const queryClient = useQueryClient();
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

  const { mutate: confirmDeadEvents } = useMutation({
    mutationFn: (time) =>
      new StripeService(null, () => accessToken).markStripeEventsAsNotified(
        time,
      ),
    onSuccess: async () => {
      await queryClient.invalidateQueries({
        queryKey: stripeKeys.deadCounts(),
      }); // 기존 숫자를 stale 처리, 자동 fetch
    },
  });

  const {
    data: {
      events = [],
      totalMatchingEvents = 0,
      totalPages = 0,
      pageLimit = 0,
    } = {},
    error: eventError,
    isFetching: isFetchingData,
  } = useQuery({
    // 필터, 페이지가 바뀌면 다른 데이터
    queryKey: stripeKeys.events(
      filters.event_type,
      filters.status,
      filters.timeRange,
      currentPage,
    ),
    queryFn: ({ signal }) =>
      new StripeService(signal, () => accessToken).getErroredStripeEvents({
        event_type: filters.event_type,
        status: filters.status,
        created_from: getTimeRangeStart(filters.timeRange),
        page: currentPage,
      }),
    placeholderData: keepPreviousData, // 새 데이터가 도착하면 그때 바꿈
    enabled: !!accessToken,
    ...POLLING_30S,
  });

  const {
    data: eventTypes = [],
    isLoading: isFetchingEventTypes,
    error: eventTypesError,
  } = useQuery({
    queryKey: stripeKeys.eventTypes(
      filters.event_type,
      filters.status,
      filters.timeRange,
    ),
    queryFn: ({ signal }) =>
      new StripeService(signal, () => accessToken).getEventTypes(),
    staleTime: 1000 * 60 * 10,
    enabled: !!accessToken,
  });

  const {
    data: statusSummary = { failedCount: 0, deadCount: 0 },
    isLoading: isFetchingCount,
    error: eventsCountError,
  } = useQuery({
    queryKey: stripeKeys.erroredCounts(
      filters.event_type,
      filters.status,
      filters.timeRange,
    ),
    queryFn: ({ signal }) =>
      new StripeService(
        signal,
        () => accessToken,
      ).getErroredStripeEventsCount(),
    placeholderData: keepPreviousData,
    staleTime: 0,
    refetchInterval: adaptivePolling,
    refetchIntervalInBackground: false, // 사용자가 안 보고 있으면 API 요청?
    refetchOnWindowFocus: true, // 탭에 다시 돌아왔을 때 refetch?
    enabled: !!accessToken,
  });

  const {
    data: deadSummary = { count: 0, lastSeenTime: null },
    isLoading: isFetchingDeadCount,
    error: deadEventsCountError,
  } = useQuery({
    queryKey: stripeKeys.deadCounts(),
    queryFn: ({ signal }) =>
      new StripeService(signal, () => accessToken).getStripeDeadEventsCount(),
    enabled: !!accessToken,
    ...POLLING_30S,
  });

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
  }, [queryClient, currentPage, totalPages, filters]);

  return {
    events,
    eventTypes,
    statusSummary,
    filters,
    totalMatchingEvents,
    totalPages,
    pageLimit,
    currentPage,
    deadSummary,
    confirmDeadEvents,
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
