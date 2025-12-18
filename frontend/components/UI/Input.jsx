import { EyeIcon, EyeSlashIcon } from "@heroicons/react/24/outline";
import { useState } from "react";

export default function Input({ label, id, type, register, error, ...props }) {
  const [showPassword, setShowPassword] = useState(false);
  const isPassword = type === "password";

  return (
    <div className="flex flex-col gap-1">
      <label
        htmlFor={id}
        className="text-sm font-medium text-gray-700 tracking-wide"
      >
        {label}
      </label>

      <div className="relative">
        <input
          id={id}
          name={id}
          {...register}
          {...props}
          className={`w-full border rounded-md px-3 py-2 text-gray-800 focus:outline-none transition 
          ${
            error
              ? "border-red-500 focus:ring-2 focus:ring-red-400"
              : "border-gray-300 focus:ring-2 focus:ring-yellow-400 focus:border-yellow-400"
          }`}
        />
        {isPassword && (
          <button
            type="button"
            onClick={() => setShowPassword((prev) => !prev)}
            className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-700"
          >
            {showPassword ? (
              <EyeSlashIcon className="h-5 w-5" />
            ) : (
              <EyeIcon className="h-5 w-5" />
            )}
          </button>
        )}
      </div>

      {error && (
        <span className="text-sm text-red-500 mt-1">
          {error.message || "This field is required"}
        </span>
      )}
    </div>
  );
}
// {errors.mail && <p role="alert">{errors.mail.message}</p>}
