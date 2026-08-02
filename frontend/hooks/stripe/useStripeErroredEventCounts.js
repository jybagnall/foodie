import { useQuery, keepPreviousData } from "@tanstack/react-query";
import { stripeKeys } from "../../react-query/queryKeys";
import { adaptivePolling } from "../../react-query/queryConfig";
import StripeService from "../../services/stripe.service";
import useAccessToken from "../auth/useAccessToken";
import useUserId from "../auth/useUserId";

export default function useStripeErroredEventCounts(filters) {
  const accessToken = useAccessToken();
  const userId = useUserId();

  const {
    data: erroredEventCounts = { failedCount: 0, deadCount: 0 },
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
    enabled: !!userId,
  });

  return { erroredEventCounts, isFetchingCount, eventsCountError };
}
