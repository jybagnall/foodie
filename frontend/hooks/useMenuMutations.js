import { useQueryClient, useMutation } from "@tanstack/react-query";
import MenuService from "../services/menu.service";

export default function useMenuMutations(accessToken) {
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

// onError 는 정확히 뭘까
// 🤔 enabled: !!accessToken 은 필요없나?
