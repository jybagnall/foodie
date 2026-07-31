import { useParams } from "react-router-dom";
import { useEffect, useState } from "react";
import useAdminMenu from "../../../hooks/menu/useAdminMenu";
import MenuName from "./MenuName";
import Spinner from "../../user_feedback/Spinner";
import PageError from "../../user_feedback/PageError";
import MenuImage from "./MenuImage";
import MenuPrice from "./MenuPrice";
import MenuDescription from "./MenuDescription";
import BackToDash from "../../UI/BackToDash";
import useAdminMenuMutations from "../../../hooks/useAdminMenuMutations";
import Button from "../../UI/Button";
import AlertModal from "../../UI/AlertModal";
import ErrorAlert from "../../user_feedback/ErrorAlert";
import EditMenuModal from "./EditMenuModal";
import MenuImageUploader from "./MenuImageUploader";
import MenuDetailsForm from "./MenuDetailsForm";

export default function EditMenuDetails() {
  const { menuId: stringMenuId } = useParams();
  const menuId = Number(stringMenuId);
  const { menu, fetchingError, isFetchingMenu } = useAdminMenu(menuId);
  const { deleteMenu, isMenuDeleteError, isMenuDeleting } =
    useAdminMenuMutations(menuId);
  const [editingField, setEditingField] = useState(null);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);

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

                <div className="mt-4">
                  {isMenuDeleteError && (
                    <div className="mb-4">
                      <ErrorAlert
                        title="There was a problem with your request"
                        message="Something went wrong while deleting this menu"
                      />
                    </div>
                  )}

                  <Button
                    onClick={() => setIsDeleteModalOpen(true)}
                    className="py-1 px-3 bg-red-500 text-gray-100 border-red-300 hover:bg-red-600"
                  >
                    Delete Menu
                  </Button>
                </div>
              </div>
            </div>

            {editingField === "image" && (
              <EditMenuModal
                modalIsOpen={true}
                onCancel={() => setEditingField(null)}
              >
                <MenuImageUploader
                  menuId={menuId}
                  onCancel={() => setEditingField(null)}
                />
              </EditMenuModal>
            )}

            {["name", "price", "description"].includes(editingField) && (
              <EditMenuModal
                modalIsOpen={true}
                onCancel={() => setEditingField(null)}
              >
                <MenuDetailsForm
                  menu={menu}
                  onCancel={() => setEditingField(null)}
                  editingField={editingField}
                />
              </EditMenuModal>
            )}

            {isDeleteModalOpen && (
              <AlertModal
                activateFn={() =>
                  deleteMenu(null, {
                    onSuccess: () => setIsDeleteModalOpen(false),
                    onError: () => setIsDeleteModalOpen(false),
                  })
                }
                isActivating={isMenuDeleting}
                modalIsOpen={isDeleteModalOpen}
                onCancel={() => setIsDeleteModalOpen(false)}
                title={`Are you sure you want to permanently delete "${menu.name}"?`}
                userIntentionText="Delete"
              />
            )}
          </div>
        </div>
      </div>
    </main>
  );
}
