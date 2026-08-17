import { useQueryClient, useMutation } from "@tanstack/react-query";
import { stripeKeys } from "../../react-query/queryKeys";

import StripeService from "../../services/stripe.service";
import useAccessToken from "../auth/useAccessToken";

export default function useAcknowledgeStripeEvents() {
  const accessToken = useAccessToken();
  const queryClient = useQueryClient();

  const {
    mutate: acknowledgeDeadEvents,
    isPending: isAcknowledging,
    isError: acknowledgeFailed,
  } = useMutation({
    mutationFn: (id) =>
      new StripeService(null, () => accessToken).markStripeEventsAsNotified(id),
    onSuccess: async () => {
      await queryClient.invalidateQueries({
        queryKey: stripeKeys.deadCounts(),
      }); // 기존 숫자를 stale 처리, 자동 fetch
    },
    onError: (err) => {
      console.error("Failed to acknowledge dead Stripe events:", err);
    },
  });

  return { acknowledgeDeadEvents, isAcknowledging, acknowledgeFailed };
}
