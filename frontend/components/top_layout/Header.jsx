import { Link } from "react-router-dom";
import CurrentCart from "./CurrentCart.jsx";
import UserStatus from "./UserStatus.jsx";

export default function Header() {
  return (
    <>
      <header className="flex justify-between items-center py-4 px-4 sm:px-8 bg-[#1f2937] flex-nowrap overflow-hidden">
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
          <UserStatus />
          <Link to="/cart" className="text-yellow-300 hover:text-yellow-400">
            <CurrentCart />
          </Link>
        </nav>
      </header>
    </>
  );
}
