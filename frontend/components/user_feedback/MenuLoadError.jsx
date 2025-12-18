import ErrorAlert from "./ErrorAlert";

export default function MenuLoadError({ errorMsg }) {
  return (
    <div
      className=" flex flex-col items-center justify-center
        h-screen px-4 text-center space-y-6
        transform -translate-y-30
        lg:items-start lg:text-left lg:pl-24 
        transition-all duration-500"
    >
      <ErrorAlert
        title="Something went wrong"
        message={errorMsg || "An unexpected error occurred."}
      />

      <img
        src="/logo.jpg"
        alt="Error logo"
        className="
          opacity-80 mb-2
          w-64 sm:w-64 md:w-72 lg:w-96 xl:w-[30rem]
          h-auto
          transition-all duration-300
        "
      />

      <p className="text-gray-400 text-sm sm:text-base md:text-lg max-w-md">
        Please try refreshing the page or come back later.
      </p>
    </div>
  );
}
