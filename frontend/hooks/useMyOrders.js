import { useQuery } from "@tanstack/react-query";
import OrderService from "../services/order.service";
import useAccessToken from "./useAccessToken";
import useUserId from "./useUserId";

export default function useMyOrders() {
  const accessToken = useAccessToken();
  const userId = useUserId();

  const {
    data,
    error: ordersFetchingError,
    isFetching: isFetchingOrders,
    isFetchingNextPage,
    fetchNextPage,
    hasNextPage,
  } = useQuery({
    queryKey: ["orders", userId],
    queryFn: ({ signal, pageParam }) =>
      new OrderService(signal, () => accessToken).getMyOrders({
        cursor: pageParam,
        limit: 10,
      }),
    getNextPageParam: (lastPage) => lastPage.nextCursor ?? undefined,
    enabled: !!userId,
  });

  // pages 배열을 flat하게 펼쳐서 하나의 배열로
  const orders = data?.pages.flatMap((page) => page.orders) ?? [];

  return {
    orders,
    ordersFetchingError,
    isFetchingOrders,
    isFetchingNextPage,
    fetchNextPage,
    hasNextPage,
  };
}
// undefined를 반환하면 TanStack Query가 hasNextPage를 false로 설정함

// {id, created_at, total_amount, payment_status, item_count, preview_items= {id, name, image, qty, price}}
