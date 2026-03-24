import { useQuery } from "@tanstack/react-query";
import MenuService from "../services/menu.service";

export default function useMenu() {
  const {
    data: menu = [],
    error: fetchingError,
    isFetching: isFetchingMenu,
  } = useQuery({
    queryKey: ["menu"],
    queryFn: ({ signal }) => new MenuService(signal).getMenu(),
  });

  return { menu, fetchingError, isFetchingMenu };
}
