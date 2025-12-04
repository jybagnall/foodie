import { ExclamationTriangleIcon } from "@heroicons/react/24/outline";

export default function ErrorAlert({ title, message }) {
  if (!message || !title) return null;

  return (
    <div className="flex items-start gap-3 border border-red-400 bg-red-50 px-4 py-3 rounded-md">
      <ExclamationTriangleIcon className="h-6 w-6 text-red-500 mt-0.5 shrink-0" />
      <div>
        <p className="text-red-700 font-semibold text-sm leading-tight">
          {title}
        </p>
        <p className="text-red-600 text-sm mt-0.5">{message}</p>
      </div>
    </div>
  );
}
