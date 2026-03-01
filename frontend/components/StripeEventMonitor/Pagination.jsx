import { ChevronLeftIcon, ChevronRightIcon } from "@heroicons/react/24/outline";
import { getPaginationRange } from "../../utils/pagination";

export default function Pagination({ pagination, onPageChange }) {
  const { pageNum, totalPages, totalMatchingEvents } = pagination;

  if (totalPages <= 1) return null;

  console.log("pageNum", pageNum);
  console.log("totalPages", totalPages);
  console.log("totalMatchingEvents", totalMatchingEvents);

  const pages = getPaginationRange(pageNum, totalPages);

  return (
    <div className="flex items-center justify-between border-t border-gray-200 bg-white px-4 py-3 sm:px-6">
      <div className="hidden sm:flex sm:flex-1 sm:items-center sm:justify-between">
        <div>
          <p className="text-sm text-gray-700">
            Showing <span className="font-medium">{pageNum}</span> to{" "}
            <span className="font-medium">{totalPages}</span> of{" "}
            <span className="font-medium">{totalMatchingEvents}</span> results
          </p>
        </div>

        <div>
          <nav
            aria-label="Pagination"
            className="isolate inline-flex -space-x-px rounded-md shadow-xs"
          >
            <button
              disabled={pageNum === 1}
              onClick={() => onPageChange(pageNum - 1)}
              className="relative inline-flex items-center rounded-l-md px-2 py-2 text-gray-400 inset-ring inset-ring-gray-300 hover:bg-gray-50 focus:z-20 focus:outline-offset-0"
            >
              <span className="sr-only">Previous</span>
              <ChevronLeftIcon aria-hidden="true" className="size-5" />
            </button>

            {pages.map((page, index) => {
              if (page === "...") {
                return (
                  <span
                    key={`...-${index}`}
                    className="cursor-default relative inline-flex items-center px-4 py-2 text-sm font-semibold text-gray-700"
                  >
                    ...
                  </span>
                );
              }

              const isActive = page === pageNum;
              return (
                <button
                  key={`${page}-${index}`}
                  disabled={isActive}
                  aria-current={isActive ? "page" : undefined}
                  onClick={() => onPageChange(page)}
                  className={`relative inline-flex items-center px-4 py-2 text-sm font-semibold
              ${
                isActive
                  ? "bg-indigo-500 text-white cursor-default"
                  : "text-gray-700 hover:bg-gray-50 cursor-pointer"
              }`}
                >
                  {page}
                </button>
              );
            })}

            <button
              disabled={pageNum === totalPages}
              onClick={() => onPageChange(pageNum + 1)}
              className="relative inline-flex items-center rounded-r-md px-2 py-2 text-gray-400 inset-ring inset-ring-gray-300 hover:bg-gray-50 focus:z-20 focus:outline-offset-0"
            >
              <span className="sr-only">Next</span>
              <ChevronRightIcon aria-hidden="true" className="size-5" />
            </button>
          </nav>
        </div>
      </div>
    </div>
  );
}
