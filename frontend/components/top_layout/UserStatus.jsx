import { Link } from "react-router-dom";
import { useContext } from "react";
import { ChevronDownIcon } from "@heroicons/react/24/outline";
import AuthContext from "../../contexts/AuthContext";
import Spinner from "../user_feedback/Spinner";
import SidebarContext from "../../contexts/SidebarContext";

export default function UserStatus() {
  const { accessToken, decodedUser, isAuthLoading } = useContext(AuthContext);
  const { toggleSidebar } = useContext(SidebarContext);
  const isLoggedIn = !!accessToken;

  if (isAuthLoading) {
    return <Spinner />;
  }

  return (
    <div className="flex items-center gap-4 text-sm sm:text-base">
      {!isLoggedIn || !decodedUser ? (
        <Link
          to="/login"
          className="text-yellow-300 hover:text-yellow-400 transition-colors whitespace-nowrap"
        >
          Login
        </Link>
      ) : (
        <>
          <span
            className="cursor-pointer inline-flex items-center gap-1 whitespace-nowrap text-gray-200 hover:text-yellow-400"
            onClick={toggleSidebar}
          >
            Hello, {decodedUser.name}
            <ChevronDownIcon className="w-4 h-4 mt-2" />
          </span>
        </>
      )}
    </div>
  );
}
