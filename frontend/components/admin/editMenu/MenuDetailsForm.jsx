import { useForm } from "react-hook-form";
import useAdminMenuMutations from "../../../hooks/menu/useAdminMenuMutations";
import SpinnerMini from "../../user_feedback/SpinnerMini";
import Button from "../../UI/Button";
import Input from "../../UI/Input";
import ErrorAlert from "../../user_feedback/ErrorAlert";
import { menuFieldConfigs, menuValidationRules } from "../../../constants/menu";

export default function MenuDetailsForm({ menu, onCancel, editingField }) {
  const fieldConfig = menuFieldConfigs[editingField];
  const { updateMenuField, isMenuUpdateError, isMenuUpdating } =
    useAdminMenuMutations(menu.id);

  const {
    register,
    handleSubmit,
    formState: { errors, isDirty, isValid, touchedFields, isSubmitted },
  } = useForm({
    mode: "onChange",
    defaultValues: {
      [editingField]: menu[editingField],
    },
  });

  const onNewTextSubmit = async (data) => {
    updateMenuField(data, {
      onSuccess: () => {
        onCancel();
      },
    });
  };

  return (
    <div className="container mx-auto px-4 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-3xl">
        {isMenuUpdateError && (
          <div className="mb-4">
            <ErrorAlert
              title="There was a problem with your request"
              message="Something went wrong while updating the menu."
            />
          </div>
        )}

        <form
          className="flex flex-col gap-5"
          onSubmit={handleSubmit(onNewTextSubmit)}
        >
          <Input
            id={editingField}
            {...fieldConfig}
            register={register(editingField, menuValidationRules[editingField])}
            error={
              touchedFields[editingField] || isSubmitted
                ? errors[editingField]
                : undefined
            }
          />

          <div className="flex items-center gap-4 mt-1">
            <Button
              type="submit"
              disabled={isMenuUpdating || !isDirty || !isValid}
              className="bg-yellow-400 hover:bg-yellow-500 text-gray-900 font-semibold rounded-md transition"
            >
              {isMenuUpdating ? <SpinnerMini /> : "Save"}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}
