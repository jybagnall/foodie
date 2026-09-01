import { EyeIcon, EyeSlashIcon } from "@heroicons/react/24/outline";
import { useState } from "react";

export default function PasswordInput({ label, id, value, onChange }) {
  const [showPassword, setShowPassword] = useState(false);

  return (
    <div className="flex flex-col gap-1">
      <label
        htmlFor={id}
        className="text-sm font-medium text-gray-300 tracking-wide mb-1"
      >
        {label}
      </label>

      <div className="relative">
        <input
          id={id}
          value={value}
          onChange={onChange}
          type={showPassword ? "text" : "password"}
          className="w-full border rounded-md px-3 py-2 text-gray-400 focus:outline-none transition"
        />

        <button
          type="button"
          onClick={() => setShowPassword((prev) => !prev)}
          className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-500"
          aria-label={showPassword ? "Hide password" : "Show password"}
        >
          {showPassword ? (
            <EyeSlashIcon className="h-5 w-5" />
          ) : (
            <EyeIcon className="h-5 w-5" />
          )}
        </button>
      </div>
    </div>
  );
}
