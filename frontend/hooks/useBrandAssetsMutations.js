import { useQueryClient, useMutation } from "@tanstack/react-query";
import MenuService from "../services/menu.service";
import useAccessToken from "./useAccessToken";
import BrandService from "../services/brand.service";

export default function useBrandAssetsMutations() {
  const accessToken = useAccessToken();
  const queryClient = useQueryClient();

  const {
    mutate: uploadImgAsset,
    isError,
    isPending: isUploading,
    reset,
  } = useMutation({
    mutationFn: (formData) =>
      new BrandService(null, () => accessToken).uploadImgAsset(formData),
    onMutate: () => reset(), // 새 요청 시작 시 에러 초기화
    onSuccess: async () => {
      await queryClient.invalidateQueries({
        queryKey: ["brand-settings"],
      });
    },
  });

  return { uploadImgAsset, isError, isUploading };
}
