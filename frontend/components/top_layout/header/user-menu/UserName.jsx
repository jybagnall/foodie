import { Link, useNavigate } from "react-router-dom";
import { useContext, useEffect, useRef, useState } from "react";
import { ChevronDownIcon } from "@heroicons/react/24/outline";
import AuthContext from "../../../../contexts/AuthContext";
import Spinner from "../../../user_feedback/Spinner";
import CartContext from "../../../../contexts/CartContext";
import UserDropdown from "./UserDropdown";
import useMyProfile from "../../../../hooks/useMyProfile";
import useServerCart from "../../../../hooks/useServerCart";
import { createCartSyncPayload } from "../../../../utils/calculateCart";

export default function UserName() {
  const navigate = useNavigate();
  const wrapperRef = useRef(null);
  const abortControllerRef = useRef(null);
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const { user } = useMyProfile();
  const { items, setItems, switchToGuestMode, mode } = useContext(CartContext);
  const { accessToken, logout, decodedUser, isAuthLoading } =
    useContext(AuthContext);
  const { syncCartToServer, isUpdatingServerCart } = useServerCart();

  const isLoggedIn = !!accessToken;

  useEffect(() => {
    return () => {
      abortControllerRef.current?.abort();
    };
  }, []);

  const handleMouseEnter = () => {
    setIsMenuOpen(true);
  };

  const handleMouseLeave = (e) => {
    if (wrapperRef.current?.contains(e.relatedTarget)) return;
    setIsMenuOpen(false);
  };

  const handleNameClick = () => {
    if (accessToken) {
      navigate("/my-account");
    } else {
      navigate("/login");
    }
  };

  const handleLogout = async () => {
    await syncCartToServer(createCartSyncPayload(items)).catch(() => {}); // 에러가 생겨도 무시

    setItems([]);
    setIsMenuOpen(false);
    switchToGuestMode();
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
        <div
          ref={wrapperRef}
          onMouseEnter={handleMouseEnter}
          onMouseLeave={handleMouseLeave}
          className="relative pb-2"
        >
          <span
            className="cursor-pointer inline-flex items-center gap-1 whitespace-nowrap text-gray-200 hover:text-yellow-400"
            onClick={handleNameClick}
          >
            Hello, {user?.name}
            <ChevronDownIcon className="w-4 h-4 mt-2" />
          </span>

          {isMenuOpen && (
            <UserDropdown
              onLogout={handleLogout}
              isUpdatingServerCart={isUpdatingServerCart}
            />
          )}
        </div>
      )}
    </div>
  );
}
