import { Link } from "react-router-dom";
import CurrentCart from "./cart/CurrentCart.jsx";
import UserName from "./user-menu/UserName.jsx";

export default function Header() {
  return (
    <>
      <header className="flex justify-between items-center py-4 px-4 sm:px-8 bg-gray-800 flex-nowrap">
        <Link className="flex items-center gap-2 sm:gap-4 flex-shrink-0" to="/">
          <img
            src="/logo.jpg"
            alt="Logo"
            className="w-12 h-12 sm:w-16 sm:h-16 object-contain rounded-full border-2 border-yellow-300"
          />
          <h1 className="text-2xl font-bold text-yellow-300 whitespace-nowrap">
            Foodie
          </h1>
        </Link>

        <nav className="flex items-center gap-4 sm:gap-8 flex-shrink-0">
          <UserName />

          <Link to="/cart" className="text-yellow-300 hover:text-yellow-400">
            <CurrentCart />
          </Link>
        </nav>
      </header>
    </>
  );
}
