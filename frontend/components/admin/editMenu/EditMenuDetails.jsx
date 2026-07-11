import { useParams } from "react-router-dom";
import { useEffect, useState } from "react";
import useAdminMenu from "../../../hooks/useAdminMenu";
import MenuName from "./MenuName";
import Spinner from "../../user_feedback/Spinner";
import PageError from "../../user_feedback/PageError";
import MenuImage from "./MenuImage";
import MenuPrice from "./MenuPrice";
import MenuDescription from "./MenuDescription";
import EditImageModal from "./EditImageModal";
import EditTextModal from "./EditTextModal";
import BackToDash from "../../UI/BackToDash";

export default function EditMenuDetails() {
  const { menuId } = useParams();
  const { menu, fetchingError, isFetchingMenu } = useAdminMenu(menuId);
  const [editingField, setEditingField] = useState(null);

  useEffect(() => {
    document.title = "Edit Menu | Foodie";
  }, []);

  if (isFetchingMenu) {
    return <Spinner />;
  }

  if (fetchingError) {
    return <PageError />;
  }

  return (
    <main className="min-h-screen flex justify-center items-start py-10 px-4">
      <div className="w-full max-w-lg">
        <div className="mb-4">
          <BackToDash url="/admin" dashboardName="Back to admin dashboard" />
        </div>
        <div className="flex flex-col grow justify-center items-center text-center p-4">
          <div className="flex flex-col items-center">
            <MenuImage
              image={menu.image}
              editable={true}
              onEdit={() => setEditingField("image")}
            />

            <div className="flex flex-col grow justify-center items-center text-center p-4">
              <div className="flex flex-col items-center">
                <MenuName
                  name={menu.name}
                  editable={true}
                  onEdit={() => setEditingField("name")}
                />
                <MenuPrice
                  price={menu.price}
                  editable={true}
                  onEdit={() => setEditingField("price")}
                />
                <MenuDescription
                  description={menu.description}
                  editable={true}
                  onEdit={() => setEditingField("description")}
                />
              </div>
            </div>
          </div>
          {editingField === "image" && (
            <EditImageModal
              modalIsOpen={editingField === "image"}
              onCancel={() => setEditingField(null)}
              menuId={menuId}
            />
          )}

          {["name", "price", "description"].includes(editingField) && (
            <EditTextModal
              modalIsOpen={true}
              onCancel={() => setEditingField(null)}
              menu={menu}
              editingField={editingField}
            />
          )}
        </div>
      </div>
    </main>
  );
}
