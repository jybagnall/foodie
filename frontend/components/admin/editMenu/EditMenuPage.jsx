import { useEffect } from "react";
import useMenus from "../../../hooks/menu/useMenus";
import BackToDash from "../../UI/BackToDash";
import Spinner from "../../user_feedback/Spinner";
import PageError from "../../user_feedback/PageError";
import EditableMenuItem from "./EditableMenuItem";

export default function EditMenuPage() {
  const { menus, fetchingError, isFetchingMenus } = useMenus();

  useEffect(() => {
    document.title = "Edit Menu | Foodie";
  }, []);

  if (isFetchingMenus) {
    return <Spinner />;
  }

  if (fetchingError) {
    return <PageError title="We couldn’t load the menu data" />;
  }

  return (
    <div className="min-h-screen">
      <div className="flex p-6">
        <div className="mb-4">
          <BackToDash url="/admin" dashboardName="Back to admin dashboard" />
        </div>
      </div>

      <ul className="w-[80%] max-w-[1200px] list-none my-8 mx-auto p-4 grid gap-6 grid-cols-1 sm:grid-cols-1 md:grid-cols-2 lg:grid-cols-3">
        {menus.map((m) => (
          <EditableMenuItem key={m.id} menuItem={m} />
        ))}
      </ul>
    </div>
  );
}
