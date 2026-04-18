import { useQueryClient, useMutation } from "@tanstack/react-query";
import MenuService from "../services/menu.service";
import useAccessToken from "./useAccessToken";

export default function useMenuMutations() {
  const accessToken = useAccessToken();
  const queryClient = useQueryClient();

  const {
    mutate: createMenu,
    isError,
    error,
    isPending: isUploading,
  } = useMutation({
    mutationFn: (formData) =>
      new MenuService(null, () => accessToken).createMenu(formData),
    onSuccess: async () => {
      await queryClient.invalidateQueries({
        queryKey: ["menu"],
      }); // 기존 데이터 stale 처리, 자동 fetch
    },
  });

  return { createMenu, isError, error, isUploading };
}

// 여기서 onError 필요없는 이유:
// isError와 error를 반환해서 컴포넌트에서 직접 처리함
// 만약 toast 알림을 쓴다면 여기서 onError에 정의 가능.
