import { ChevronLeftIcon } from "@heroicons/react/24/outline";
import { Link } from "react-router-dom";

export default function BackToDash({ url, dashboardName, title = "" }) {
  return (
    <>
      <Link
        to={url}
        className="flex items-center gap-2 text-indigo-200 hover:text-indigo-300 font-small"
      >
        <span>
          <ChevronLeftIcon className="size-5" />
        </span>{" "}
        {dashboardName}
      </Link>
      <h1 className="text-xl font-semibold text-gray-400 m-2">{title}</h1>
    </>
  );
}
