import { useContext, useEffect, useRef, useState } from "react";
import { getUserErrorMessage } from "../../utils/getUserErrorMsg";
import ErrorAlert from "../user_feedback/ErrorAlert";
import AuthContext from "../../contexts/AuthContext";
import { useForm } from "react-hook-form";
import AccountService from "../../services/account.service";
import SpinnerMini from "../user_feedback/SpinnerMini";
import Button from "../UI/Button";
import Input from "../UI/Input";
import { Link } from "react-router-dom";
import { ExclamationTriangleIcon } from "@heroicons/react/24/outline";

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
    abortControllerRef.current?.abort();
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
    return (
      <div className="flex items-start justify-center min-h-screen bg-gray-800 pt-24 px-4">
        <div className="bg-gray-700 text-white rounded-2xl shadow-lg p-8 max-w-lg w-full text-center border border-red-500/30">
          <div className="flex items-center justify-center gap-2 mb-3">
            <ExclamationTriangleIcon className="h-5 w-5 text-red-500" />

            <p className="text-lg font-semibold text-red-400">
              Invalid invitation
            </p>
          </div>

          <p className="text-md text-gray-300 mb-6 leading-relaxed">
            This reset link has expired. Please request a new one to continue.
          </p>

          <Link
            to="/forgot-password"
            className="block w-full bg-indigo-400 hover:bg-indigo-500 text-white py-2 px-4 rounded-lg transition duration-200"
          >
            Resend reset link
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-3xl">
        <form
          className="flex flex-col gap-5 mt-20"
          // className="flex flex-col gap-5"
          onSubmit={handleSubmit(onPasswordSubmit)}
        >
          <Input
            label="New Password"
            type="password"
            id="password"
            register={register("password", {
              required: "Please enter new password.",
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
              type="submit"
              disabled={isProcessing}
              className="bg-yellow-400 hover:bg-yellow-500 text-gray-900 font-semibold rounded-md transition"
            >
              {isProcessing ? <SpinnerMini /> : "Save"}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}
