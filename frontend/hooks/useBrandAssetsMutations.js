import { useQueryClient, useMutation } from "@tanstack/react-query";
import useAccessToken from "./useAccessToken";
import BrandService from "../services/brand.service";

export default function useBrandAssetsMutations() {
  const accessToken = useAccessToken();
  const queryClient = useQueryClient();

  const {
    mutate: uploadImgAsset,
    isError,
    isPending: isUploading,
  } = useMutation({
    mutationFn: (formData) =>
      new BrandService(null, () => accessToken).uploadImgAsset(formData),
    onSuccess: async () => {
      await queryClient.invalidateQueries({
        queryKey: ["brand-settings"],
      });
    },
  });

  return { uploadImgAsset, isError, isUploading };
}
