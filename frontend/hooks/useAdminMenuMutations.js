import { useQueryClient, useMutation } from "@tanstack/react-query";
import MenuService from "../services/menu.service";
import useAccessToken from "./useAccessToken";
import BrandService from "../services/brand.service";

export default function useAdminMenuMutations(menuId) {
  const accessToken = useAccessToken();
  const queryClient = useQueryClient();

  const {
    mutate: updateImage,
    isError: isImageUpdateError,
    isPending: isImageUpdating,
  } = useMutation({
    mutationFn: (formData) =>
      new MenuService(null, () => accessToken).updateImage(menuId, formData),
    onSuccess: async () => {
      queryClient.invalidateQueries({ queryKey: ["menu", menuId] });
      queryClient.invalidateQueries({ queryKey: ["menus"] });
    },
  });

  const {
    mutate: updateMenuField,
    isError: isMenuUpdateError,
    isPending: isMenuUpdating,
  } = useMutation({
    mutationFn: (payload) =>
      new MenuService(null, () => accessToken).updateMenuField(menuId, payload),
    onSuccess: async () => {
      queryClient.invalidateQueries({ queryKey: ["menu", menuId] });
      queryClient.invalidateQueries({ queryKey: ["menus"] });
    },
  });

  return {
    updateImage,
    isImageUpdateError,
    isImageUpdating,
    updateMenuField,
    isMenuUpdateError,
    isMenuUpdating,
  };
}
