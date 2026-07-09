import { useForm } from "react-hook-form";
import useAdminMenuMutations from "../../../hooks/useAdminMenuMutations";
import SpinnerMini from "../../user_feedback/SpinnerMini";
import Button from "../../UI/Button";
import Input from "../../UI/Input";
import ErrorAlert from "../../user_feedback/ErrorAlert";

export default function MenuTextForm({ menu, onCancel, editingField }) {
  const { updateTextField, isTextUpdateError, isTextUpdating } =
    useAdminMenuMutations(menu.id);

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isDirty },
  } = useForm();

  const onNewTextSubmit = async ({ editingField }) => {
    updateTextField(editingField, {
      onSuccess: () => {
        reset();
        onCancel();
      },
    });
  };

  return (
    <div className="container mx-auto px-4 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-3xl">
        {/* Breadcrumb */}

        {isTextUpdateError && (
          <div className="mb-4">
            <ErrorAlert
              title="There was a problem with your request"
              message="Something went wrong while saving your name"
            />
          </div>
        )}

        <form
          className="flex flex-col gap-5"
          onSubmit={handleSubmit(onNewTextSubmit)}
        >
          {editingField === "name" && (
            <Input
              label="New Menu Name"
              type="text"
              id="name"
              defaultValue={menu.name}
              register={register("name", {
                required: "Menu name is required.",
                minLength: {
                  value: 2,
                  message: "Menu name must be at least 2 characters long.",
                },
                maxLength: {
                  value: 50,
                  message: "Menu name must be under 50 characters.",
                },
                validate: {
                  noSpacesOnly: (value) =>
                    value.trim().length > 0 ||
                    "Menu name cannot be blank or spaces only.",
                },
              })}
              error={errors.name}
            />
          )}

          {editingField === "price" && (
            <Input
              label="New Price"
              type="number"
              id="price"
              defaultValue={menu.price}
              step="0.01"
              register={register("price", {
                required: "Price is required.",
                min: {
                  value: 1,
                  message: "Price must be greater than 0.",
                },
                validate: {
                  isNumber: (value) =>
                    !isNaN(value) || "Price must be a number.",
                },
                pattern: {
                  value: /^\d+(\.\d{1,2})?$/,
                  message: "Price can have up to 2 decimal places.",
                },
              })}
              error={errors.price}
            />
          )}

          {editingField === "description" && (
            <Input
              label="New Description"
              type="text"
              id="description"
              defaultValue={menu.description}
              register={register("description", {
                required: "Please enter a description.",
                minLength: {
                  value: 5,
                  message: "Description must be at least 5 characters long.",
                },
                maxLength: {
                  value: 200,
                  message: "Description cannot exceed 200 characters.",
                },
                validate: {
                  noSpacesOnly: (value) =>
                    value.trim().length > 0 ||
                    "Description cannot be blank or spaces only.",
                },
              })}
              error={errors.description}
            />
          )}

          <div className="flex items-center gap-4 mt-1">
            <Button
              type="submit"
              disabled={isTextUpdateError || !isDirty}
              className="bg-yellow-400 hover:bg-yellow-500 text-gray-900 font-semibold rounded-md transition"
            >
              {isTextUpdating ? <SpinnerMini /> : "Save"}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}
