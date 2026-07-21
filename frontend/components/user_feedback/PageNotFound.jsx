import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import Button from "../UI/Button";

export default function PageNotFound() {
  const navigate = useNavigate();

  useEffect(() => {
    document.title = "Page Not Found | Foodie";
  }, []);

  return (
    <main className="grid min-h-full place-items-center bg-white px-6 py-24 sm:py-32 lg:px-8">
      <div className="text-center">
        <p className="text-base font-semibold text-sky-700">404</p>
        <h1 className="mt-4 text-5xl font-semibold tracking-tight text-balance text-sky-950 sm:text-7xl">
          Page not found
        </h1>
        <p className="mt-6 text-lg font-medium text-pretty text-gray-500 sm:text-xl/8">
          Sorry, we couldn’t find the page you’re looking for.
        </p>
        <div className="mt-10 flex items-center justify-center gap-x-6">
          <Button
            onClick={() => navigate("/")}
            className="bg-sky-800 text-white hover:bg-sky-700 px-3.5 py-2.5"
          >
            Go back to menu
          </Button>
        </div>
      </div>
    </main>
  );
}
