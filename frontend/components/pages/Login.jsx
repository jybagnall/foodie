import { useForm } from "react-hook-form";
import { useNavigate, Link, useLocation } from "react-router-dom";
import AuthContext from "../../contexts/AuthContext";
import { useContext, useEffect, useState } from "react";
import AccountService from "../../services/account.service";
import Button from "../UI/Button";
import Input from "../UI/Input";
import Spinner from "../UI/Spinner";
import ErrorAlert from "../UI/ErrorAlert";

// 로그인 실패시 띄울 화면이 정의되지 않음
// 비밀번호가 보였으면 좋겠음
export default function Login() {
  const navigate = useNavigate();
  const location = useLocation();
  const previousLocation = location.state?.from || "/";

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
    setIsLoginProcessing(true);

    const accountService = new AccountService(
      new AbortController(),
      authContext
    );

    try {
      const { tokenPair } = await accountService.loginUser(email, password);
      authContext.applyAuthTokens(tokenPair);
      navigate(previousLocation, { replace: true }); // 이전 페이지로 이동
    } catch (err) {
      const returnedErrorMsg = err?.response?.data?.error || err.message;
      setErrorMsg(returnedErrorMsg);
      // toast.error(errorMsg || "Unexpected error");
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
              className="text-blue-600 hover:text-blue-800 text-sm font-medium transition-colors duration-200"
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

            <div className="mt-8">
              <Button
                type="submit"
                propStyle="py-1 px-3 bg-yellow-300 text-gray-800 border-yellow-300 hover:bg-yellow-400"
              >
                Sign In
              </Button>

              <p className="mt-6 pt-4 flex items-center text-gray-600 text-sm">
                <span className="grow h-px bg-gray-300"></span>
                <span className="px-3 whitespace-nowrap">New to Foodie?</span>
                <span className="grow h-px bg-gray-300"></span>
              </p>

              <Link
                to="/signup"
                className="py-1 px-3 bg-gray-300 text-gray-800 border-gray-300 hover:bg-gray-400 cursor-pointer border rounded-md font-semibold shadow-md  hover:shadow-lg transition-all duration-200"
              >
                Create a new Foodie account
              </Link>
            </div>
          </form>
        </section>
      </div>
    </main>
  );
}
