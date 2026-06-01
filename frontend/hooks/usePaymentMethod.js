import { useQuery } from "@tanstack/react-query";
import useAccessToken from "./useAccessToken";
import PaymentMethodsService from "../services/payment-methods.service";

export default function usePaymentMethod(stripePaymentMethodId) {
  const accessToken = useAccessToken();

  const {
    data: paymentMethod,
    isFetching: isPaymentMethodFetching,
    error: paymentMethodFetchingError,
  } = useQuery({
    queryKey: ["paymentMethod", stripePaymentMethodId],
    queryFn: ({ signal }) =>
      new PaymentMethodsService(
        signal,
        () => accessToken,
      ).getPaymentMethodByStripeId(stripePaymentMethodId),
    enabled: !!stripePaymentMethodId,
    staleTime: Infinity,
    retry: false,
  });

  return { paymentMethod, isPaymentMethodFetching, paymentMethodFetchingError };
}
