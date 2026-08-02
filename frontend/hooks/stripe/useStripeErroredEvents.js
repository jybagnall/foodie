import { useQuery, keepPreviousData } from "@tanstack/react-query";
import { stripeKeys } from "../../react-query/queryKeys";
import { POLLING_30S } from "../../react-query/queryConfig";
import { getTimeRangeStart } from "../../utils/format";
import StripeService from "../../services/stripe.service";
import useAccessToken from "../auth/useAccessToken";
import useUserId from "../auth/useUserId";

export default function useStripeErroredEvents(filters, currentPage) {
  const accessToken = useAccessToken();
  const userId = useUserId();

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
    enabled: !!userId,
    ...POLLING_30S,
  });

  return {
    events,
    totalMatchingEvents,
    totalPages,
    pageLimit,
    eventError,
    isFetchingData,
  };
}
