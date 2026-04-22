import { useQuery } from "@tanstack/react-query";
import PaymentMethodsService from "../services/payment-methods.service";
import useAccessToken from "./useAccessToken";
import useUserId from "./useUserId";

export default function useSavedCards() {
  const accessToken = useAccessToken();
  const userId = useUserId();

  const {
    data: savedCards = [],
    isPending: isFetching,
    isError: isFetchingError,
  } = useQuery({
    queryKey: ["savedCards", userId],
    queryFn: ({ signal }) =>
      new PaymentMethodsService(signal, () => accessToken).getSavedCards(),
    staleTime: 1000 * 60 * 5,
    enabled: !!userId,
  });

  return { savedCards, isFetching, isFetchingError };
}
