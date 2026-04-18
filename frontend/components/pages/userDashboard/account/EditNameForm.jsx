import { useEffect } from "react";
import { useForm } from "react-hook-form";
import { useNavigate } from "react-router-dom";
import useMyProfile from "../../../../hooks/useMyProfile";
import Input from "../../../UI/Input";
import Button from "../../../UI/Button";
import SpinnerMini from "../../../user_feedback/SpinnerMini";
import ErrorAlert from "../../../user_feedback/ErrorAlert";
import useMyProfileMutations from "../../../../hooks/useMyProfileMutations";

export default function EditNameForm() {
  const navigate = useNavigate();
  const { user } = useMyProfile();
  const { updateName, isUpdatingName, isUpdateNameError } =
    useMyProfileMutations();

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isDirty },
  } = useForm();

  useEffect(() => {
    document.title = "Edit Name | Foodie";
  }, []);

  useEffect(() => {
    if (user) {
      reset({ name: user.name });
    }
  }, [user, reset]);

  const onNameSubmit = async ({ name }) => {
    updateName(name, {
      onSuccess: () => {
        navigate("/my-account", { replace: true });
      },
    });
  };

  const onCancelSubmit = () => {
    navigate("/my-account");
  };

  return (
    <div className="container mx-auto px-4 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-3xl">
        {/* Breadcrumb */}

        {isUpdateNameError && (
          <div className="mb-4">
            <ErrorAlert
              title="There was a problem with your request"
              message="Something went wrong while saving your name"
            />
          </div>
        )}

        <form
          className="flex flex-col gap-5"
          onSubmit={handleSubmit(onNameSubmit)}
        >
          <Input
            label="Full Name"
            type="text"
            id="name"
            register={register("name", {
              required: true,
              minLength: 5,
              maxLength: 20,
            })}
            error={errors.name}
          />
          <div className="flex items-center gap-4 mt-1">
            <Button
              type="button"
              textOnly
              className="text-gray-300"
              onClick={onCancelSubmit}
            >
              Cancel
            </Button>
            <Button
              type="submit"
              disabled={isUpdatingName || !isDirty}
              className="bg-yellow-400 hover:bg-yellow-500 text-gray-900 font-semibold rounded-md transition"
            >
              {isUpdatingName ? <SpinnerMini /> : "Save"}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}
