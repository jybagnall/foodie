import { useEffect } from "react";
import Spinner from "../../user_feedback/Spinner";
import PageError from "../../user_feedback/PageError";
import useMenus from "../../../hooks/useMenus";
import MenuItemSwitcher from "./MenuItemSwitcher";

export default function UserLanding() {
  const { menus, fetchingError, isFetchingMenus } = useMenus();

  useEffect(() => {
    document.title = "Menu | Foodie";
  }, []);

  if (isFetchingMenus) {
    return <Spinner />;
  }

  if (fetchingError) {
    return <PageError title="We couldn’t load the menu" />;
  } // 스타일을 바꿔야함

  return (
    <ul className="w-[80%] max-w-[1200px] list-none my-8 mx-auto p-4 grid gap-6 grid-cols-1 sm:grid-cols-1 md:grid-cols-2 lg:grid-cols-3">
      {menus.map((m) => (
        <MenuItemSwitcher key={m.id} menuItem={m} />
      ))}
    </ul>
  );
}
