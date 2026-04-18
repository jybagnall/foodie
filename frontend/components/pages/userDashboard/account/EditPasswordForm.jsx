import { useEffect } from "react";
import { useForm } from "react-hook-form";
import { useNavigate } from "react-router-dom";
import useMyProfileMutations from "../../../../hooks/useMyProfileMutations";
import ErrorAlert from "../../../user_feedback/ErrorAlert";
import Input from "../../../UI/Input";
import Button from "../../../UI/Button";
import SpinnerMini from "../../../user_feedback/SpinnerMini";
import getUserErrorMessage from "../../../../utils/getUserErrorMsg";

export default function EditPasswordForm() {
  const navigate = useNavigate();
  const { updatePassword, isUpdatingPassword, updatePasswordError } =
    useMyProfileMutations();

  const {
    register,
    getValues,
    handleSubmit,
    formState: { errors, isDirty },
  } = useForm();

  useEffect(() => {
    document.title = "Change Password | Foodie";
  }, []);

  const onPasswordSubmit = async ({ currentPassword, password }) => {
    updatePassword(
      { currentPassword, password },
      {
        onSuccess: () => {
          navigate("/my-account", { replace: true });
        },
      },
    );
  };

  const onCancelSubmit = () => {
    navigate("/my-account");
  };

  return (
    <div className="container mx-auto px-4 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-3xl">
        {/* Breadcrumb */}

        {updatePasswordError && (
          <div className="mb-4">
            <ErrorAlert
              title="There was a problem with your request"
              message={getUserErrorMessage(updatePasswordError)}
            />
          </div>
        )}

        <form
          className="flex flex-col gap-5"
          onSubmit={handleSubmit(onPasswordSubmit)}
        >
          <Input
            label="Current password"
            type="password"
            id="currentPassword"
            register={register("currentPassword", {
              required: "Please enter current password.",
            })}
            error={errors.currentPassword}
          />

          <Input
            label="New Password"
            type="password"
            id="password"
            register={register("password", {
              required: "Please enter new password.",
              validate: (value) =>
                value !== getValues("currentPassword") ||
                "New password must be different from current password.",
              minLength: {
                value: 6,
                message: "Password must be at least 6 characters long.",
              },
            })}
            error={errors.password}
          />

          <Input
            label="Confirm new password"
            type="password"
            id="confirmPassword"
            register={register("confirmPassword", {
              required: "Please confirm your password.",
              validate: (value) =>
                value === getValues("password") || "Passwords do not match.",
            })}
            error={errors.confirmPassword}
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
              disabled={isUpdatingPassword || !isDirty}
              className="bg-yellow-400 hover:bg-yellow-500 text-gray-900 font-semibold rounded-md transition"
            >
              {isUpdatingPassword ? <SpinnerMini /> : "Save"}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}
