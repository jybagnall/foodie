import { useQuery } from "@tanstack/react-query";
import { stripeKeys } from "../../react-query/queryKeys";
import StripeService from "../../services/stripe.service";
import useAccessToken from "../auth/useAccessToken";
import useUserId from "../auth/useUserId";

export default function useStripeEventTypes(filters) {
  const accessToken = useAccessToken();
  const userId = useUserId();

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
    enabled: !!userId,
  });

  return { eventTypes, isFetchingEventTypes, eventTypesError };
}
