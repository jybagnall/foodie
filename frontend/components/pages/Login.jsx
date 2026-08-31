import { useForm } from "react-hook-form";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { useContext, useEffect, useRef, useState } from "react";
import AuthContext from "../../contexts/AuthContext";
import AccountService from "../../services/account.service";
import Button from "../UI/Button";
import Input from "../UI/Input";
import Spinner from "../user_feedback/Spinner";
import ErrorAlert from "../user_feedback/ErrorAlert";
import { getUserErrorMessage } from "../../utils/getUserErrorMsg";
import { signupValidationRules } from "../../constants/auth";
import SignupPrompt from "../authUI/SignupPrompt";

export default function Login() {
  const authContext = useContext(AuthContext);
  const abortControllerRef = useRef(null);
  const [isLoginProcessing, setIsLoginProcessing] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");
  const location = useLocation();
  const navigate = useNavigate();
  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm();

  useEffect(() => {
    document.title = "Log in | Foodie";

    return () => abortControllerRef.current?.abort();
  }, []);

  useEffect(() => {
    if (!location.state?.reset) return;

    reset();
    setErrorMsg("");

    // '/login' 페이지에 reset 정보를 전달한다
    navigate("/login", {
      replace: true, // 방금 받은 reset: true 정보를 주소 기록에서 없앰
      state: null,
    });
  }, [location.state, navigate, reset]);

  const onLogin = async ({ email, password }) => {
    if (isLoginProcessing) return;

    abortControllerRef.current = new AbortController();

    const accountService = new AccountService(
      abortControllerRef.current.signal,
    );

    setIsLoginProcessing(true);
    setErrorMsg("");
    try {
      const { accessToken } = await accountService.loginUser(email, password);
      authContext.handleLoginSuccess(accessToken);
    } catch (err) {
      console.error(err);
      const message = getUserErrorMessage(err);
      if (message) {
        setErrorMsg(message);
      }
    } finally {
      setIsLoginProcessing(false);
    }
  };

  if (isLoginProcessing) {
    return <Spinner />;
  }

  return (
    <main className="min-h-screen flex justify-center items-start py-20 px-4">
      <div className="w-full max-w-lg">
        {errorMsg && (
          <div className="mb-4">
            <ErrorAlert title="We couldn’t sign you in" message={errorMsg} />
          </div>
        )}

        <section className="w-full max-w-lg bg-gray-700 shadow-xl rounded-xl p-8">
          <div className="flex justify-between items-center mt-8">
            <h2 className="text-2xl font-semibold text-gray-200 mb-6 border-b pb-3">
              Sign in
            </h2>
            <Link
              to="/forgot-password"
              className="text-blue-200 hover:text-blue-300 text-sm font-medium transition-colors duration-200"
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
              register={register("email", signupValidationRules.email)}
              error={errors.email}
            />
            <Input
              label="Password"
              type="password"
              id="password"
              register={register("password", {
                required: "Please enter password.",
              })}
              error={errors.password}
            />
            <div className="mt-4">
              <Button
                type="submit"
                variant="primary"
                disabled={isLoginProcessing}
              >
                Sign In
              </Button>

              <SignupPrompt />
            </div>
          </form>
        </section>
      </div>
    </main>
  );
}
