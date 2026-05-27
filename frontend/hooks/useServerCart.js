import { useQuery, useQueryClient, useMutation } from "@tanstack/react-query";
import useAccessToken from "./useAccessToken";
import useUserId from "./useUserId";
import CartService from "../services/cart.service";

export default function useServerCart() {
  const accessToken = useAccessToken();
  const userId = useUserId();
  const queryClient = useQueryClient();

  const {
    data: serverCartItems,
    isSuccess: isServerCartReady,
    error: serverCartFetchingError,
  } = useQuery({
    queryKey: ["serverCart", userId],
    queryFn: ({ signal }) =>
      new CartService(signal, () => accessToken).getMyCart(),
    enabled: !!userId && !!accessToken,
    staleTime: Infinity, // 직접 업데이트
    retry: false,
    refetchOnWindowFocus: false, // 탭으로 돌아올 때
    refetchOnReconnect: false, // 인터넷 재연결 시
  });

  const {
    mutateAsync: syncCartToServer,
    isPending: isUpdatingServerCart,
    isError: isUpdateError,
  } = useMutation({
    mutationFn: (payload) => {
      return new CartService(null, () => accessToken).syncCartToServer(payload);
    },
    retry: 2,
    onSuccess: (data) => {
      queryClient.setQueryData(["serverCart", userId], data);
    }, // 캐시를 직접 업데이트
    onError: (err) => {
      console.error("Failed to sync cart", err);
    },
  });

  return {
    serverCartItems,
    isServerCartReady,
    serverCartFetchingError,
    syncCartToServer,
    isUpdatingServerCart,
    isUpdateError,
  };
}

// payload = {
//   items: items.map((i) => ({
//     menuId: i.id,
//     qty: i.qty,
//   })),
// };
