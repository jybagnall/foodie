import { useForm } from "react-hook-form";
import { Link } from "react-router-dom";
import AuthContext from "../../contexts/AuthContext";
import { useContext, useEffect, useState } from "react";
import AccountService from "../../services/account.service";
import Button from "../UI/Button";
import Input from "../UI/Input";
import Spinner from "../user_feedback/Spinner";
import ErrorAlert from "../user_feedback/ErrorAlert";

// 없는 회원이 로그인을 시도했는데 서버 에러 혹은 유효하지 않은 토큰이라고 나옴.
export default function Login() {
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm();

  useEffect(() => {
    document.title = "Log in - Foodie";
  }, []);

  const authContext = useContext(AuthContext);

  const [isLoginProcessing, setIsLoginProcessing] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");

  const handleLogin = async (email, password) => {
    const accountService = new AccountService(
      new AbortController(),
      authContext,
    );

    setIsLoginProcessing(true);
    setErrorMsg("");
    try {
      const { accessToken } = await accountService.loginUser(email, password);
      authContext.applyAccessToken(accessToken);
    } catch (err) {
      const returnedErrorMsg = err?.response?.data?.error || err.message;
      setErrorMsg(returnedErrorMsg);
    } finally {
      setIsLoginProcessing(false);
    }
  };

  const onLogin = ({ email, password }) => {
    handleLogin(email, password);
  };

  if (isLoginProcessing) {
    return <Spinner />;
  }

  return (
    <main className="min-h-screen flex justify-center items-start bg-gray-50 py-20 px-4">
      <div className="w-full max-w-lg">
        {errorMsg && (
          <div className="mb-4">
            <ErrorAlert title="There was a problem" message={errorMsg} />
          </div>
        )}

        <section className="w-full max-w-lg bg-white shadow-xl rounded-xl p-8">
          <div className="flex justify-between items-center mt-8">
            <h2 className="text-2xl font-semibold text-gray-800 mb-6 border-b pb-3">
              Sign in
            </h2>
            <Link
              to="/forgot-password"
              className="text-blue-700 hover:text-blue-600 text-sm font-medium transition-colors duration-200"
            >
              Forgot password?
            </Link>
          </div>

          <form
            className="flex flex-col gap-5"
            onSubmit={handleSubmit(onLogin)}
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
            <div className="mt-4">
              <Button
                type="submit"
                propStyle="py-1 px-3 bg-blue-600 hover:bg-blue-700 text-white"
              >
                Sign In
              </Button>

              <div className="flex flex-col items-center text-center mt-6 text-gray-600 text-sm">
                <p className="flex items-center w-full justify-center gap-2">
                  <span className="h-px w-40 bg-gray-300" />
                  <span className="whitespace-nowrap">New to Foodie?</span>
                  <span className="h-px w-40 bg-gray-300" />
                </p>

                <Link
                  to="/signup"
                  className="mt-4 text-blue-700 hover:text-blue-600 cursor-pointer font-semibold transition-all duration-200"
                >
                  Create a new Foodie account
                </Link>
              </div>
            </div>
          </form>
        </section>
      </div>
    </main>
  );
}
