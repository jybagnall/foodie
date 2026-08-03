import { Link } from "react-router-dom";

export default function SignupPrompt() {
  return (
    <div className="flex flex-col items-center text-center mt-6 text-gray-200 text-sm">
      <p className="flex items-center w-full justify-center gap-2">
        <span className="h-px w-40 bg-gray-300" />
        <span className="whitespace-nowrap">New to Foodie?</span>
        <span className="h-px w-40 bg-gray-300" />
      </p>

      <Link
        to="/signup"
        className="mt-4 text-blue-200 hover:text-blue-300 cursor-pointer font-semibold transition-all duration-200"
      >
        Create a new Foodie account
      </Link>
    </div>
  );
}
