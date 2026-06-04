import { useInfiniteQuery } from "@tanstack/react-query";
import OrderService from "../services/order.service";
import useAccessToken from "./useAccessToken";
import useUserId from "./useUserId";

const PAGE_SIZE = 10;

export default function useMyOrders() {
  const accessToken = useAccessToken();
  const userId = useUserId();

  // const {
  //   data,
  //   error: ordersFetchingError,
  //   isPending: isFetchingOrders,
  //   isFetchingNextPage,
  //   fetchNextPage,
  //   hasNextPage,
  // } = useInfiniteQuery({
  //   queryKey: ["orders", userId],
  //   queryFn: ({ signal, pageParam }) =>
  //     new OrderService(signal, () => accessToken).getMyOrders({
  //       cursor: pageParam,
  //       limit: PAGE_SIZE,
  //     }),
  //   initialPageParam: null, // 첫 요청엔 cursor 없음을 명시
  //   getNextPageParam: (lastPage) => lastPage.nextCursor ?? undefined,
  //   enabled: !!userId,
  // });
  const result = useInfiniteQuery({
    queryKey: ["orders", userId],
    // queryFn: ({ signal, pageParam }) =>
    //   new OrderService(signal, () => accessToken).getMyOrders({
    //     cursor: pageParam,
    //     limit: PAGE_SIZE,
    //   }),
    queryFn: ({ signal, pageParam }) => {
      console.log("queryFn 실행됨, pageParam:", pageParam);
      return new OrderService(signal, () => accessToken).getMyOrders({
        cursor: pageParam,
        limit: PAGE_SIZE,
      });
    },
    initialPageParam: null, // 첫 요청엔 cursor 없음을 명시
    getNextPageParam: (lastPage) => lastPage.nextCursor ?? undefined,

    enabled: !!userId,
  });

  const orders = result.data?.pages.flatMap((page) => page.orders) ?? [];

  return {
    orders,
    ordersFetchingError: result.error,
    isFetchingOrders: result.isPending,
    isFetchingNextPage: result.isFetchingNextPage,
    fetchNextPage: result.fetchNextPage,
    hasNextPage: result.hasNextPage,
  };

  // // pages 배열을 flat하게 펼쳐서 하나의 배열로
  // const orders = data?.pages.flatMap((page) => page.orders) ?? [];

  // return {
  //   orders,
  //   ordersFetchingError,
  //   isFetchingOrders,
  //   isFetchingNextPage,
  //   fetchNextPage,
  //   hasNextPage,
  // };
}
// undefined를 반환하면 TanStack Query가 hasNextPage를 false로 설정함

// {id, created_at, total_amount, payment_status, item_count, preview_items= {id, name, image, qty, price}}
