import { useEffect, useRef, useState } from "react";
import Input from "../UI/Input";
import Button from "../UI/Button";
import SpinnerMini from "../user_feedback/SpinnerMini";
import { useForm } from "react-hook-form";
import AccountService from "../../services/account.service";
import { getUserErrorMessage } from "../../utils/getUserErrorMsg";
import ErrorAlert from "../user_feedback/ErrorAlert";

export default function ForgotPassword() {
  const abortControllerRef = useRef(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");
  const [submitted, setSubmitted] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm();

  useEffect(() => {
    document.title = "Password reset | Foodie";

    return () => {
      abortControllerRef.current?.abort();
    };
  }, []);

  const onEmailSubmit = async ({ email }) => {
    abortControllerRef.current?.abort();
    abortControllerRef.current = new AbortController();

    const accountService = new AccountService(
      abortControllerRef.current.signal,
    );

    setErrorMsg("");
    setIsProcessing(true);

    try {
      await accountService.forgotPassword(email);
      setSubmitted(true);
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

  if (submitted) {
    return (
      <div className="flex items-start justify-center min-h-screen bg-gray-800 pt-24">
        <div className="bg-gray-700 text-white rounded-2xl shadow-lg p-8 max-w-lg w-full text-center">
          <p className="text-lg font-semibold mb-2">Check your email 📩</p>

          <p className="text-md text-gray-300 mb-6 leading-relaxed">
            We've sent you a password reset link. Please check your inbox.
          </p>

          <button
            onClick={() => setSubmitted(false)}
            className="w-full bg-indigo-400 hover:bg-indigo-500 text-white py-2 px-4 rounded-lg transition duration-200"
          >
            Didn’t receive the email? Try again
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-3xl">
        {/* Breadcrumb */}

        {errorMsg && (
          <div className="mb-4">
            <ErrorAlert
              title="There was a problem with your request"
              message={errorMsg}
            />
          </div>
        )}

        <form
          className="flex flex-col gap-5 mt-20"
          onSubmit={handleSubmit(onEmailSubmit)}
        >
          <Input
            label="Email"
            type="email"
            id="email"
            register={register("email", {
              required: "Email is required",
              pattern: {
                value: /^\S+@\S+$/i,
                message: "Please enter a valid email address.",
              },
            })}
            error={errors.email}
          />
          <div className="flex items-center gap-4 mt-1">
            <Button
              type="submit"
              disabled={isProcessing}
              className="bg-yellow-400 hover:bg-yellow-500 text-gray-900 font-semibold rounded-md transition"
            >
              {isProcessing ? <SpinnerMini /> : "Submit"}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}
