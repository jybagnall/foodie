import { ShoppingCartIcon } from "@heroicons/react/24/outline";
import { Link } from "react-router-dom";

export default function EmptyCart() {
  return (
    <main className="min-h-screen flex justify-center items-start bg-gray-50 py-20 px-4">
      <div className="w-full max-w-lg">
        <div className="flex flex-col items-center justify-center py-6 text-center text-gray-600">
          <ShoppingCartIcon className="w-24 h-24 text-gray-600" />
          <p className="text-lg font-medium">Your cart is currently empty.</p>
        </div>

        <div className="flex justify-center items-center -mt-3 pt-4">
          <Link to="/" className="px-3 py-1 rounded-md text-orange-600">
            Browse menu
          </Link>
        </div>
      </div>
    </main>
  );
}
