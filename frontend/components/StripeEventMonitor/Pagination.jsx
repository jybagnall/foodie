import { ChevronLeftIcon, ChevronRightIcon } from "@heroicons/react/24/outline";
import { getPaginationRange } from "../../utils/pagination";
import useStripeEventMonitor from "../../hooks/useStripeEventMonitor";
import { useSearchParams } from "react-router-dom";

export default function Pagination({ onPageChange }) {
  const [searchParams, setSearchParams] = useSearchParams();
  const { currentPage, totalPages, totalMatchingEvents } =
    useStripeEventMonitor();

  const pages = getPaginationRange(currentPage, totalPages);

  function nextPage() {
    const next = currentPage === totalPages ? currentPage : currentPage + 1;
    searchParams.set("page", next);
    setSearchParams(searchParams);
  }

  function prevPage() {
    const prev = currentPage === 1 ? currentPage : currentPage - 1;
    searchParams.set("page", prev);
    setSearchParams(searchParams);
  }

  if (totalPages <= 1) return null;

  return (
    <div className="flex items-center justify-between border-t border-gray-200 bg-white px-4 py-3 sm:px-6">
      <div className="hidden sm:flex sm:flex-1 sm:items-center sm:justify-between">
        <div>
          <p className="text-sm text-gray-700">
            Showing <span className="font-medium">{currentPage}</span> to{" "}
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
              disabled={currentPage === 1}
              onClick={prevPage}
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

              const isActive = page === currentPage;
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
              disabled={currentPage === totalPages}
              onClick={nextPage}
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
