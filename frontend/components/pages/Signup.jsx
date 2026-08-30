import { useContext, useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useForm } from "react-hook-form";
import AccountService from "../../services/account.service";
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

export default function Signup() {
  const [isSignupProcessing, setIsSignupProcessing] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");
  const authContext = useContext(AuthContext);
  const abortControllerRef = useRef(null);
  const navigate = useNavigate();

  const {
    register,
    getValues,
    handleSubmit,
    watch,
    formState: { errors },
  } = useForm();

  useEffect(() => {
    document.title = "Signup | Foodie";

    return () => abortControllerRef.current?.abort();
  }, []);

  const onSignupSubmit = async ({ name, email, password }) => {
    if (isSignupProcessing) return;

    abortControllerRef.current = new AbortController();
    const accountService = new AccountService(
      abortControllerRef.current.signal,
    );

    setIsSignupProcessing(true);
    setErrorMsg("");

    try {
      const { accessToken } = await accountService.createUserAccount(
        name,
        email,
        password,
      );

      if (!accessToken) {
        navigate("/login");
        return;
      }

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

  return (
    <main className="min-h-screen flex justify-center items-start py-20 px-4">
      <div className="w-full max-w-lg">
        <section className="w-full max-w-lg bg-gray-700 shadow-xl rounded-xl p-8">
          {errorMsg && (
            <div className="mb-4">
              <ErrorAlert
                title="We couldn’t create your account"
                message={errorMsg}
              />
            </div>
          )}
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
              <Button
                type="submit"
                className="py-1 px-3 bg-blue-600 hover:bg-blue-700 text-white"
              >
                Create your Foodie account
              </Button>
            </div>
          </form>
        </section>
      </div>
    </main>
  );
}
