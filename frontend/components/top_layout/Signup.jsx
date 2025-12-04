import { useContext, useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import AccountService from "../../services/account.service";
import AuthContext from "../../contexts/AuthContext";
import Button from "../UI/Button";
import Input from "../UI/Input";
import Spinner from "../UI/Spinner";
import ErrorAlert from "../UI/ErrorAlert";

export default function Signup() {
  const [isSignupProcessing, setIsSignupProcessing] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");

  const authContext = useContext(AuthContext);

  const {
    register,
    watch,
    handleSubmit,
    formState: { errors },
  } = useForm();

  const onSignupSubmit = async (name, email, password) => {
    const accountService = new AccountService(
      new AbortController(),
      authContext
    );

    setIsSignupProcessing(true);
    try {
      const { tokenPair } = await accountService.createUserAccount(
        name,
        email,
        password
      );
      authContext.applyAuthTokens(tokenPair);
      //navigate("/", { replace: true });
    } catch (err) {
      console.error(err);
      const returnedErrorMsg =
        err.response?.data?.error || "Unexpected login error";
      setErrorMsg(returnedErrorMsg);
    } finally {
      setIsSignupProcessing(false);
    }
  };

  useEffect(() => {
    document.title = "Signup | Foodie";
  }, []);

  if (isSignupProcessing) {
    return <Spinner />;
  }

  return (
    <main className="min-h-screen flex justify-center items-start bg-gray-50 py-20 px-4">
      <div className="w-full max-w-lg">
        {errorMsg && (
          <div className="mb-4">
            <ErrorAlert
              title="There was a problem with your request"
              message={errorMsg}
            />
          </div>
        )}

        <section className="w-full max-w-lg bg-white shadow-xl rounded-xl p-8">
          <h2 className="text-2xl font-semibold text-gray-800 mb-6 border-b pb-3">
            Create account
          </h2>

          <form
            className="flex flex-col gap-5"
            onSubmit={handleSubmit((name, email, password) =>
              onSignupSubmit(name, email, password)
            )}
          >
            <Input
              label="Your Name"
              type="text"
              id="name"
              register={register("name", {
                required: true,
                minLength: 5,
                maxLength: 20,
              })}
              error={errors.name}
            />
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
            <Input
              label="Password"
              type="password"
              id="password"
              register={register("password", {
                required: "Please enter password.",
                minLength: {
                  value: 6,
                  message: "Password must be at least 6 characters long.",
                },
                maxLength: {
                  value: 12,
                  message: "Password must not exceed 12 characters.",
                },
              })}
              error={errors.password}
            />

            <Input
              label="Re-enter Password"
              type="password"
              id="confirmPassword"
              register={register("confirmPassword", {
                required: "Please confirm your password.",
                validate: (value) =>
                  value === watch("password") || "Passwords do not match.",
              })}
              error={errors.confirmPassword}
            />

            <div className="mt-8">
              <Button
                type="submit"
                propStyle="py-1 px-3 bg-yellow-300 text-gray-800 border-yellow-300 hover:bg-yellow-400"
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
