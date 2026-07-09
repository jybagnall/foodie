import { useQuery } from "@tanstack/react-query";
import MenuService from "../services/menu.service";
import useAccessToken from "./useAccessToken";

export default function useAdminMenu(menuId) {
  const accessToken = useAccessToken();

  const {
    data: menu,
    error: fetchingError,
    isFetching: isFetchingMenu,
  } = useQuery({
    queryKey: ["menu", menuId],
    queryFn: ({ signal }) =>
      new MenuService(signal, () => accessToken).getMenuDetail(menuId),
    enabled: !!accessToken && !!menuId,
    staleTime: Infinity,
  });

  return { menu, fetchingError, isFetchingMenu };
}
