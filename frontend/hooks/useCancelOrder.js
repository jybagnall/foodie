import { useMutation, useQueryClient } from "@tanstack/react-query";
import OrderService from "../services/order.service";
import useAccessToken from "./useAccessToken";
import useUserId from "./useUserId";

export default function useCancelOrder(orderId) {
  const accessToken = useAccessToken();
  const userId = useUserId();
  const queryClient = useQueryClient(); // 기존 데이터에 접근 가능

  const {
    mutate: cancelOrder,
    isPending: isCanceling,
    isError: isCancelError,
  } = useMutation({
    mutationFn: (orderId) =>
      new OrderService(null, () => accessToken).cancelOrder(orderId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["order", orderId] });
      queryClient.invalidateQueries({ queryKey: ["orders", userId] });
    },
  });

  return {
    cancelOrder,
    isCanceling,
    isCancelError,
  };
}
