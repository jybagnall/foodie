import { useQuery } from "@tanstack/react-query";
import OrderService from "../services/order.service";
import useAccessToken from "./useAccessToken";
import useUserId from "./useUserId";

export default function useMyOrders() {
  const accessToken = useAccessToken();
  const userId = useUserId();

  const {
    data: orders = [],
    error: ordersFetchingError,
    isFetching: isFetchingOrders,
  } = useQuery({
    queryKey: ["orders", userId],
    queryFn: ({ signal }) =>
      new OrderService(signal, () => accessToken).getMyOrders(),
    enabled: !!userId,
  });

  return { orders, ordersFetchingError, isFetchingOrders };
}

// {id, created_at, total_amount, payment_status, item_count, preview_items= {name, image, qty}}
