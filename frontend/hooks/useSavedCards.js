import { useQuery, useQueryClient, useMutation } from "@tanstack/react-query";
import PaymentMethodsService from "../services/payment-methods.service";
import useAccessToken from "./useAccessToken";
import useUserId from "./useUserId";

export default function useSavedCards() {
  const accessToken = useAccessToken();
  const userId = useUserId();
  const queryClient = useQueryClient();

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

  const {
    mutate: deleteCard,
    isPending: isDeleting,
    isError: isDeleteError,
  } = useMutation({
    mutationFn: (id) =>
      new PaymentMethodsService(null, () => accessToken).deletePaymentMethod(
        id,
      ),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["savedCards", userId] });
    },
  });

  return {
    savedCards,
    isFetching,
    isFetchingError,
    deleteCard,
    isDeleting,
    isDeleteError,
  };
}
