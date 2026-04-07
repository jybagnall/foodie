import { ExclamationTriangleIcon } from "@heroicons/react/24/outline";

export default function PageError({
  title = "An unexpected error occured",
  message = "Please try refreshing the page or come back later.",
}) {
  return (
    <div className="w-full min-h-screen flex items-center justify-center px-4 sm:px-6 lg:px-8 -translate-y-20">
      <div className="w-full max-w-xl p-6 sm:p-10">
        {/* 🔹 Title */}
        <div className="flex items-center gap-3 mb-6 ml-20">
          <ExclamationTriangleIcon className="h-6 w-6 text-orange-400 shrink-0" />
          <p className="text-yellow-500 font-semibold text-lg">{title}</p>
        </div>

        {/* 🔹 Image */}
        <div className="relative group mb-6">
          <img
            src="/menu-failure.jpg"
            alt="Error illustration"
            className="w-full max-w-md mx-auto 
            rounded-xl shadow-2xl opacity-95 
            transition-transform duration-500 
            group-hover:scale-105 object-contain"
          />
        </div>

        {/* 🔹 Message */}
        <p className="text-gray-300 text-sm sm:text-base text-center leading-relaxed">
          {message}
        </p>
      </div>
    </div>
  );
}
