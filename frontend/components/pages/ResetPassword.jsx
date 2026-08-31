import { useForm } from "react-hook-form";
import { useContext, useEffect, useRef, useState } from "react";
import { getUserErrorMessage } from "../../utils/getUserErrorMsg";
import ErrorAlert from "../user_feedback/ErrorAlert";
import AuthContext from "../../contexts/AuthContext";
import AccountService from "../../services/account.service";
import SpinnerMini from "../user_feedback/SpinnerMini";
import Button from "../UI/Button";
import PasswordField from "../UI/PasswordField";
import InvalidResetLink from "../authUI/InvalidResetLink";

export default function ResetPassword() {
  const [isProcessing, setIsProcessing] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");
  const [resetToken, setResetToken] = useState("");
  const [isTokenValid, setIsTokenValid] = useState(true);
  const abortControllerRef = useRef(null);
  const authContext = useContext(AuthContext);
  const {
    register,
    getValues,
    handleSubmit,
    watch,
    formState: { errors },
  } = useForm();

  useEffect(() => {
    document.title = "Reset Password | Foodie";

    const urlParams = new URLSearchParams(window.location.search);
    const tokenFromUrl = urlParams.get("token");

    if (!tokenFromUrl) {
      setIsTokenValid(false);
    } else {
      setResetToken(tokenFromUrl);
      setIsTokenValid(true);
    }

    return () => abortControllerRef.current?.abort();
  }, []);

  const onPasswordSubmit = async ({ password }) => {
    if (isProcessing) return;

    abortControllerRef.current = new AbortController();
    const accountService = new AccountService(
      abortControllerRef.current.signal,
    );

    setErrorMsg("");
    setIsProcessing(true);

    try {
      const { accessToken } = await accountService.resetPasswordRequest(
        resetToken,
        password,
      );
      authContext.handleLoginSuccess(accessToken);
    } catch (err) {
      console.error(err);
      const message = getUserErrorMessage(err);
      if (message) {
        setErrorMsg(message);
      }
    } finally {
      setIsProcessing(false);
    }
  };

  if (!isTokenValid) {
    return <InvalidResetLink />;
  }

  return (
    <div className="container mx-auto px-4 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-3xl">
        {errorMsg && (
          <div className="mb-4">
            <ErrorAlert title="We couldn’t reset password" message={errorMsg} />
          </div>
        )}

        <form
          className="flex flex-col gap-5 mt-20"
          onSubmit={handleSubmit(onPasswordSubmit)}
        >
          <PasswordField
            register={register}
            errors={errors}
            watch={watch}
            getValues={getValues}
          />

          <div className="flex items-center gap-4 mt-1">
            <Button type="submit" disabled={isProcessing} variant="accent">
              {isProcessing ? <SpinnerMini /> : "Save"}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}
