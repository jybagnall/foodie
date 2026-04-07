import { useQuery, useQueryClient } from "@tanstack/react-query";
import OrderService from "../services/order.service";

export default function useOrder(accessToken, orderId) {
  const queryClient = useQueryClient(); // 기존 캐시에 접근 가능

  const {
    data: order = {}, // ?
    error: orderFetchingError,
    isFetching: isFetchingOrder,
  } = useQuery({
    queryKey: ["order", orderId], // ["orders", 1], ["orders", 2]..
    queryFn: ({ signal }) =>
      new OrderService(signal, () => accessToken).getMyOrder(orderId),
    enabled: !!accessToken && !!orderId,
    initialData: () => {
      const orders = queryClient.getQueryData(["orders"]);
      return orders?.find((o) => o.id === Number(orderId)); // 클릭한 주문
    }, // 이미 리스트에 있는 데이터로 먼저 보여줘라
    initialDataUpdatedAt: () =>
      queryClient.getQueryState(["orders"])?.dataUpdatedAt,
  }); // 오래된 데이터면 → refetch, 최신이면 → 유지

  return { order, orderFetchingError, isFetchingOrder };
}
