import { useQuery } from "@tanstack/react-query";
import MenuService from "../../services/menu.service";

export default function useMenus() {
  const {
    data: menus = [],
    error: fetchingError,
    isFetching: isFetchingMenus,
  } = useQuery({
    queryKey: ["menus"],
    queryFn: ({ signal }) => new MenuService(signal).getMenus(),
  });

  return { menus, fetchingError, isFetchingMenus };
}
