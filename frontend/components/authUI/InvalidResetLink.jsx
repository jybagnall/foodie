import { Link } from "react-router-dom";
import { ExclamationTriangleIcon } from "@heroicons/react/24/outline";

export default function InvalidResetLink() {
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
