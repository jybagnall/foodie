import { useContext, useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import useMyProfileMutations from "../../../../hooks/profile/useMyProfileMutations";
import AuthContext from "../../../../contexts/AuthContext";
import ErrorAlert from "../../../user_feedback/ErrorAlert";
import Button from "../../../UI/Button";
import PasswordInput from "../../../UI/PasswordInput";

const DELETE_CONFIRMATION = "DELETE MY ACCOUNT";

export default function DeleteAccount() {
  const [currentPassword, setCurrentPassword] = useState("");
  const [confirmation, setConfirmation] = useState("");
  const navigate = useNavigate();
  const { logout } = useContext(AuthContext);
  const { deleteAccount, isDeletingAccount, deleteAccountError } =
    useMyProfileMutations();

  useEffect(() => {
    document.title = "Delete Account | Foodie";
  }, []);

  const didUserConfirm = confirmation === DELETE_CONFIRMATION;
  const canDelete = didUserConfirm && currentPassword.length > 0;

  const handleDeleteAccount = () => {
    if (!canDelete || isDeletingAccount) return;

    deleteAccount(
      { currentPassword },
      {
        onSuccess: () => {
          logout(); // clearSession + navigate까지 AuthContext가 처리
        },
      },
    );
  };

  const onCancelSubmit = () => {
    navigate("/my-account");
  };

  return (
    <>
      {deleteAccountError && (
        <div className="mb-4 w-fit">
          <ErrorAlert
            title="There was a problem with your request"
            message="Something went wrong while deleting your account"
          />
        </div>
      )}

      <section className="rounded-xl border border-red-200 p-6 shadow-sm bg-gray-700 dark:border-red-900/50 dark:bg-gray-900">
        <div className="mb-6">
          <h2 className="text-lg font-semibold text-gray-200 dark:text-white">
            Delete Account
          </h2>

          <p className="mt-2 text-sm leading-6 text-gray-200 dark:text-gray-400">
            Deleting your account will permanently remove all data associated
            with your account. This action cannot be undone.
          </p>
        </div>

        <div className="rounded-lg border border-red-200 bg-red-50 p-4 dark:border-red-900/50 dark:bg-red-950/30">
          <h3 className="font-medium text-red-800 dark:text-red-300">
            Please make sure you understand the following before deleting your
            account.
          </h3>

          <ul className="mt-3 list-disc space-y-1 pl-5 text-sm leading-6 text-red-700 dark:text-red-400">
            <li>You will lose access to your account.</li>{" "}
            <li>Your account cannot be recovered once it has been deleted.</li>{" "}
            <li>
              Any ongoing processes or services associated with your account may
              be affected.
            </li>
          </ul>
        </div>

        <div className="mt-6">
          <PasswordInput
            label="Enter your password"
            id="current_password"
            value={currentPassword}
            onChange={(e) => setCurrentPassword(e.target.value)}
          />

          <label
            htmlFor="delete-confirmation"
            className="block mt-6 text-sm font-medium text-gray-200 dark:text-gray-200"
          >
            To continue, type{" "}
            <span className="font-semibold text-red-600 dark:text-red-400">
              {DELETE_CONFIRMATION}
            </span>
          </label>

          <input
            id="delete-confirmation"
            type="text"
            value={confirmation}
            onChange={(e) => setConfirmation(e.target.value)}
            disabled={isDeletingAccount}
            placeholder={DELETE_CONFIRMATION}
            autoComplete="off"
            className="mt-2 block w-full rounded-lg border border-gray-300 bg-white px-3 py-2.5 text-sm text-gray-900 outline-none transition placeholder:text-gray-400 focus:border-red-500 focus:ring-2 focus:ring-red-500/20 disabled:cursor-not-allowed disabled:bg-gray-100 dark:border-gray-700 dark:bg-gray-800 dark:text-white dark:placeholder:text-gray-500 dark:disabled:bg-gray-800"
          />
        </div>

        <div className="mt-6 flex justify-end gap-4">
          <Button
            type="button"
            variant="text"
            className="text-gray-100 hover:bg-gray-500"
            onClick={onCancelSubmit}
          >
            Cancel
          </Button>
          <Button
            type="button"
            onClick={handleDeleteAccount}
            disabled={!canDelete || isDeletingAccount}
            variant="danger"
          >
            {isDeletingAccount ? "Deleting account..." : "Delete Account"}
          </Button>
        </div>
      </section>
    </>
  );
}
