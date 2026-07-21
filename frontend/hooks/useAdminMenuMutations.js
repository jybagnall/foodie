import { useQueryClient, useMutation } from "@tanstack/react-query";
import { useNavigate } from "react-router-dom";
import MenuService from "../services/menu.service";
import useAccessToken from "./useAccessToken";
import BrandService from "../services/brand.service";

export default function useAdminMenuMutations(menuId) {
  const accessToken = useAccessToken();
  const queryClient = useQueryClient();
  const navigate = useNavigate();

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

  const {
    mutate: deleteMenu,
    isError: isMenuDeleteError,
    isPending: isMenuDeleting,
  } = useMutation({
    mutationFn: () =>
      new MenuService(null, () => accessToken).deleteSingleMenu(menuId),
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: ["menus"] });
      navigate("/admin/edit-menu");
    },
  });

  return {
    updateImage,
    isImageUpdateError,
    isImageUpdating,
    updateMenuField,
    isMenuUpdateError,
    isMenuUpdating,
    deleteMenu,
    isMenuDeleteError,
    isMenuDeleting,
  };
}
