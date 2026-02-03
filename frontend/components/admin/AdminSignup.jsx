import { useContext, useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import AdminService from "../../services/admin.service";
import AuthContext from "../../contexts/AuthContext";
import Button from "../UI/Button";
import Input from "../UI/Input";
import Spinner from "../user_feedback/Spinner";
import ErrorAlert from "../user_feedback/ErrorAlert";

export default function AdminSignup() {
  const [isSignupProcessing, setIsSignupProcessing] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");
  const [inviteToken, setInviteToken] = useState("");
  const [isTokenValid, setIsTokenValid] = useState(true);

  const authContext = useContext(AuthContext);

  const {
    register,
    watch,
    handleSubmit,
    formState: { errors },
  } = useForm();

  useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search);
    const tokenFromUrl = urlParams.get("token");

    if (!tokenFromUrl) {
      setErrorMsg(
        "This invitation link is invalid or expired. Please contact your admin for a new one.",
      );
      setIsTokenValid(false);
      return;
    }

    setInviteToken(tokenFromUrl);
    setIsTokenValid(true);
  }, []);

  const onSignupSubmit = async ({ name, email, password }) => {
    const adminService = new AdminService(new AbortController());

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
      const returnedErrorMsg =
        err.response?.data?.error || "Unexpected signup error";
      setErrorMsg(returnedErrorMsg);
    } finally {
      setIsSignupProcessing(false);
    }
  };

  useEffect(() => {
    document.title = "Admin Signup | Foodie";
  }, []);

  if (isSignupProcessing) {
    return <Spinner />;
  }

  if (!isTokenValid) {
    return (
      <main className="flex justify-center items-center h-screen">
        <ErrorAlert title="Invalid Invitation" message={errorMsg} />
      </main>
    );
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
            onSubmit={handleSubmit(onSignupSubmit)}
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
                Create your Foodie admin account
              </Button>
            </div>
          </form>
        </section>
      </div>
    </main>
  );
}
