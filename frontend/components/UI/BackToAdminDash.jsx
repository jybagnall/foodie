import { ChevronLeftIcon } from "@heroicons/react/24/outline";
import { Link } from "react-router-dom";

export default function BackToAdminDash({ title = "" }) {
  return (
    <>
      <Link
        to="/admin"
        className="flex items-center gap-2 text-indigo-600 hover:text-indigo-800 font-small"
      >
        <span>
          <ChevronLeftIcon className="size-5" />
        </span>{" "}
        Back to admin dashboard
      </Link>
      <h1 className="text-xl font-semibold text-gray-800 m-2">{title}</h1>
    </>
  );
}
