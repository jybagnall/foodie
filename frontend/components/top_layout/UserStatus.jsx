import { Link, useNavigate } from "react-router-dom";
import { useContext } from "react";
import Cookies from "js-cookie";
import { ChevronDownIcon } from "@heroicons/react/24/outline";
import AuthContext from "../../contexts/AuthContext";
import Spinner from "../user_feedback/Spinner";
import SidebarContext from "../../contexts/SidebarContext";

export default function UserStatus() {
  const navigate = useNavigate();
  const { accessToken, logout, decodedUser, isAuthLoading } =
    useContext(AuthContext);
  const { toggleSidebar } = useContext(SidebarContext);
  const isLoggedIn = !!accessToken;

  const handleNameClick = () => {
    if (accessToken) {
      navigate("/my-account");
      toggleSidebar();
    } else {
      navigate("/login");
    }
  };

  const handleLogout = () => {
    logout();
  };

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
            onClick={handleNameClick}
          >
            Hello, {decodedUser.name}
            <ChevronDownIcon className="w-4 h-4 mt-2" />
          </span>

          <button className="text-yellow-200" onClick={handleLogout}>
            Logout
          </button>
        </>
      )}
    </div>
  );
}
