import { useQuery, useQueryClient } from "@tanstack/react-query";
import OrderService from "../services/order.service";
import useAccessToken from "./useAccessToken";

export default function useOrder(orderId) {
  const accessToken = useAccessToken();
  const queryClient = useQueryClient(); // 기존 데이터에 접근 가능

  const {
    data: orderDetail,
    isFetching,
    error: orderFetchingError,
  } = useQuery({
    queryKey: ["order", orderId], // 주문별 캐시 분리
    queryFn: ({ signal }) =>
      new OrderService(signal, () => accessToken).getMyOrder(orderId),
    enabled: !!accessToken && !!orderId,
  });

  const listData = queryClient
    .getQueryData(["orders"])
    ?.find((o) => o.id === Number(orderId));

  // 세부 정보 fetch 완료 후 → 합친 데이터
  const order = orderDetail
    ? { ...listData, ...orderDetail }
    : (listData ?? null);

  return {
    order,
    isFetching,
    orderFetchingError,
  };
}
