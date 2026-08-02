import { useQuery } from "@tanstack/react-query";
import { stripeKeys } from "../../react-query/queryKeys";
import { POLLING_30S } from "../../react-query/queryConfig";
import StripeService from "../../services/stripe.service";
import useAccessToken from "../auth/useAccessToken";
import useUserId from "../auth/useUserId";

export default function useStripeDeadSummary() {
  const accessToken = useAccessToken();
  const userId = useUserId();

  const {
    data: deadSummary = { count: 0, lastSeenId: null },
    isLoading: isFetchingDeadCount,
    error: deadEventsCountError,
  } = useQuery({
    queryKey: stripeKeys.deadCounts(),
    queryFn: ({ signal }) =>
      new StripeService(signal, () => accessToken).getStripeDeadEventsCount(),
    enabled: !!userId,
    ...POLLING_30S,
  });

  return { deadSummary, isFetchingDeadCount, deadEventsCountError };
}
