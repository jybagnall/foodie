import { ExclamationTriangleIcon } from "@heroicons/react/24/outline";

// what color is bg-[#111827]?
export default function MenuLoadError() {
  return (
    <div
      className="min-h-screen flex flex-col items-center justify-center 
      px-6 text-center space-y-8 bg-[#111827] transition-all duration-500 z-50 py-16"
    >
      <div className="flex items-start gap-3 px-4 py-3">
        <ExclamationTriangleIcon className="h-6 w-6 text-orange-400 mt-0.5 shrink-0" />

        <p className="text-yellow-400 font-semibold text-lg leading-tight">
          An unexpected error occured.
        </p>
      </div>

      <div className="relative group">
        <img
          src="/menu-failure.jpg"
          alt="Error illustration"
          className="w-64 sm:w-72 md:w-80 lg:w-96 xl:w-[30rem] 
          h-auto rounded-xl shadow-2xl opacity-95 transition-transform duration-500 
          group-hover:scale-105 group-hover:opacity-100 object-contain"
        />
        <div
          className="absolute inset-0 bg-gradient-to-t from-black/30 to-transparent 
          rounded-xl opacity-0 group-hover:opacity-100 transition-opacity duration-500"
        />
      </div>

      <p className="text-gray-400 text-sm sm:text-base md:text-lg max-w-md leading-relaxed">
        Please try refreshing the page or come back later.
      </p>
    </div>
  );
}
