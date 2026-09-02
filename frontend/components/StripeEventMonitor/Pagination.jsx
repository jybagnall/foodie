import { ChevronLeftIcon, ChevronRightIcon } from "@heroicons/react/24/outline";
import { getPaginationRange } from "../../utils/pagination";
import { useSearchParams } from "react-router-dom";

export default function Pagination({
  currentPage,
  totalPages,
  totalMatchingEvents,
  pageLimit,
}) {
  const [searchParams, setSearchParams] = useSearchParams();

  const pages = getPaginationRange(currentPage, totalPages, pageLimit);
  const startPage = (currentPage - 1) * pageLimit + 1;
  const endPage = Math.min(currentPage * pageLimit, totalMatchingEvents);
  const resultLabel = totalMatchingEvents === 1 ? "result" : "results";

  function nextPage() {
    const params = new URLSearchParams(searchParams);
    const next = currentPage === totalPages ? currentPage : currentPage + 1;
    params.set("page", next);
    setSearchParams(params);
  }

  function prevPage() {
    const params = new URLSearchParams(searchParams);
    const prev = currentPage === 1 ? currentPage : currentPage - 1;
    params.set("page", prev);
    setSearchParams(params);
  }

  function handlePageChange(pageNum) {
    const params = new URLSearchParams(searchParams);
    params.set("page", pageNum);
    setSearchParams(params);
  }

  if (totalPages <= 1) return null;

  return (
    <div className="border-t border-gray-200 bg-gray-700 px-4 py-3 sm:px-6">
      {/* Mobile */}
      <div className="flex items-center justify-between sm:hidden">
        <button
          type="button"
          disabled={currentPage === 1}
          onClick={prevPage}
          className={`inline-flex items-center gap-1 rounded-md px-3 py-2 text-sm font-medium ${
            currentPage === 1
              ? "cursor-default text-gray-500"
              : "cursor-pointer text-gray-200 hover:bg-gray-600"
          }`}
        >
          <ChevronLeftIcon aria-hidden="true" className="size-5" />
          <span>Previous</span>
        </button>

        <span className="text-sm text-gray-200">
          <span className="font-medium">{currentPage}</span>
          <span className="mx-1 text-gray-400">/</span>
          <span>{totalPages}</span>
        </span>

        <button
          type="button"
          disabled={currentPage === totalPages}
          onClick={nextPage}
          className={`inline-flex items-center gap-1 rounded-md px-3 py-2 text-sm font-medium ${
            currentPage === totalPages
              ? "cursor-default text-gray-500"
              : "cursor-pointer text-gray-200 hover:bg-gray-600"
          }`}
        >
          <span>Next</span>
          <ChevronRightIcon aria-hidden="true" className="size-5" />
        </button>
      </div>

      {/* Desktop */}
      <div className="hidden sm:flex sm:items-center sm:justify-between">
        <div>
          <p className="text-sm text-gray-200">
            Showing <span className="font-medium">{startPage}</span>
            {startPage !== endPage && (
              <>
                {" "}
                to <span className="font-medium">{endPage}</span> of{" "}
                <span className="font-medium">{totalMatchingEvents}</span>{" "}
                {resultLabel}
              </>
            )}
          </p>
        </div>

        <div>
          <nav
            aria-label="Pagination"
            className="isolate inline-flex -space-x-px rounded-md shadow-xs"
          >
            <button
              type="button"
              disabled={currentPage === 1}
              onClick={prevPage}
              className={`relative inline-flex items-center rounded-l-md px-2 py-2 inset-ring inset-ring-gray-300 focus:z-20 focus:outline-offset-0 ${
                currentPage === 1
                  ? "cursor-default text-gray-200"
                  : "cursor-pointer text-gray-500 hover:bg-gray-50"
              }`}
            >
              <span className="sr-only">Previous</span>
              <ChevronLeftIcon aria-hidden="true" className="size-5" />
            </button>

            {pages.map((page, index) => {
              if (page === "...") {
                return (
                  <span
                    key={`...-${index}`}
                    className="relative inline-flex cursor-default items-center px-4 py-2 text-sm font-semibold text-gray-200"
                  >
                    ...
                  </span>
                );
              }

              const isActive = page === currentPage;

              return (
                <button
                  type="button"
                  key={`${page}-${index}`}
                  disabled={isActive}
                  aria-current={isActive ? "page" : undefined}
                  onClick={() => handlePageChange(page)}
                  className={`relative inline-flex items-center px-4 py-2 text-sm font-semibold ${
                    isActive
                      ? "cursor-default bg-indigo-500 text-white"
                      : "cursor-pointer text-gray-200 hover:bg-gray-400"
                  }`}
                >
                  {page}
                </button>
              );
            })}

            <button
              type="button"
              disabled={currentPage === totalPages}
              onClick={nextPage}
              className={`relative inline-flex items-center rounded-r-md px-2 py-2 inset-ring inset-ring-gray-300 focus:z-20 focus:outline-offset-0 ${
                currentPage === totalPages
                  ? "cursor-default text-gray-200"
                  : "cursor-pointer text-gray-500 hover:bg-gray-50"
              }`}
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
