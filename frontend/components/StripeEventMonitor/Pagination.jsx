export default function Pagination({
  pageNum,
  totalPages,
  totalMatchingEvents,
  onPageChange,
}) {
  if (totalPages <= 1) return null;

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

            {/* 페이지의 번호 배열을 만듬 */}
            {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
              <button
                key={page}
                onClick={() => onPageChange(page)}
                className={`relative inline-flex items-center px-4 py-2 text-sm font-semibold focus:z-20 ${page === pageNum ? "bg-indigo-500 text-white z-10 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-500" : "hover:bg-gray-50 text-gray-900 focus:outline-offset-0 inset-ring inset-ring-gray-300"}`}
              >
                {page}
              </button>
            ))}

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
