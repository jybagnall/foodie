import { Link, useNavigate } from "react-router-dom";
import { useContext, useRef, useState } from "react";
import { ChevronDownIcon } from "@heroicons/react/24/outline";
import AuthContext from "../../../../contexts/AuthContext";
import Spinner from "../../../user_feedback/Spinner";
import CartContext from "../../../../contexts/CartContext";
import CartService from "../../../../services/cart.service";
import UserDropdown from "./UserDropdown";
import useMyProfile from "../../../../hooks/useMyProfile";

// 로그아웃 실패 시 에러 메시지
export default function UserName() {
  const navigate = useNavigate();
  const wrapperRef = useRef(null);

  const [isSavingCart, setIsSavingCart] = useState(false);
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const { user } = useMyProfile();
  const { clearCart, items } = useContext(CartContext);
  const { accessToken, logout, decodedUser, isAuthLoading } =
    useContext(AuthContext);

  const isLoggedIn = !!accessToken;

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

  const persistCart = async () => {
    const abortController = new AbortController();
    const cartService = new CartService(
      abortController.signal,
      () => accessToken,
    );

    const currentItems = {
      items: items.map((i) => ({
        menuId: i.id,
        qty: i.qty,
      })),
    };

    setIsSavingCart(true);
    try {
      await cartService.saveCurrentCart(currentItems);
    } catch (err) {
      const returnedErrorMsg = err?.response?.data?.error || err.message;
      console.error(returnedErrorMsg);
    } finally {
      setIsSavingCart(false);
    }
  };

  const handleLogout = async () => {
    await persistCart();
    clearCart();
    setIsMenuOpen(false);
    logout();
  };

  if (isAuthLoading || isSavingCart) {
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

          {isMenuOpen && <UserDropdown onLogout={handleLogout} />}
        </div>
      )}
    </div>
  );
}
