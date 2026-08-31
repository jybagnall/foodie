import { useContext, useEffect, useRef, useState } from "react";
import { useForm } from "react-hook-form";
import { ExclamationTriangleIcon } from "@heroicons/react/24/outline";
import AdminService from "../../services/admin.service";
import AuthContext from "../../contexts/AuthContext";
import Button from "../UI/Button";
import Input from "../UI/Input";
import Spinner from "../user_feedback/Spinner";
import ErrorAlert from "../user_feedback/ErrorAlert";
import { getUserErrorMessage } from "../../utils/getUserErrorMsg";
import {
  signupFieldConfigs,
  signupValidationRules,
} from "../../constants/auth";
import PasswordField from "../UI/PasswordField";

export default function AdminSignup() {
  const [isSignupProcessing, setIsSignupProcessing] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");
  const [inviteToken, setInviteToken] = useState("");
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
    document.title = "Admin Signup | Foodie";

    const urlParams = new URLSearchParams(window.location.search);
    const tokenFromUrl = urlParams.get("token");

    if (!tokenFromUrl) {
      setIsTokenValid(false);
    } else {
      setInviteToken(tokenFromUrl);
      setIsTokenValid(true);
    }

    return () => abortControllerRef.current?.abort();
  }, []);

  const onSignupSubmit = async ({ name, email, password }) => {
    if (isSignupProcessing) return;

    abortControllerRef.current = new AbortController();
    const adminService = new AdminService(abortControllerRef.current.signal);

    setErrorMsg("");
    setIsSignupProcessing(true);

    try {
      const { accessToken } = await adminService.createAdminAccount(
        name,
        email,
        password,
        inviteToken,
      );
      authContext.handleLoginSuccess(accessToken);
    } catch (err) {
      console.error(err);
      const message = getUserErrorMessage(err);
      if (message) {
        setErrorMsg(message);
      }
    } finally {
      setIsSignupProcessing(false);
    }
  };

  if (isSignupProcessing) {
    return <Spinner />;
  }

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
            This invitation link is invalid or expired. Please contact your
            admin for a new one.
          </p>
        </div>
      </div>
    );
  }

  return (
    <main className="min-h-screen flex justify-center items-start bg-gray-700 py-20 px-4">
      <div className="w-full max-w-lg">
        {errorMsg && (
          <div className="mb-4">
            <ErrorAlert title="We couldn’t sign you in" message={errorMsg} />
          </div>
        )}

        <section className="w-full max-w-lg bg-gray-600 shadow-xl rounded-xl p-8">
          <h2 className="text-2xl font-semibold text-gray-200 mb-6 border-b pb-3">
            Create account
          </h2>

          <form
            className="flex flex-col gap-5"
            onSubmit={handleSubmit(onSignupSubmit)}
          >
            {Object.entries(signupFieldConfigs).map(([key, config]) => (
              <Input
                key={key}
                id={key}
                {...config}
                register={register(key, signupValidationRules[key])}
                error={errors[key]}
              />
            ))}

            <PasswordField
              register={register}
              errors={errors}
              watch={watch}
              getValues={getValues}
            />

            <div className="mt-8">
              <Button type="submit" variant="primary">
                Create your Foodie admin account
              </Button>
            </div>
          </form>
        </section>
      </div>
    </main>
  );
}
