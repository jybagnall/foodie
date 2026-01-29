import { Link, useNavigate } from "react-router-dom";
import { useContext, useEffect, useState } from "react";
import { ChevronDownIcon } from "@heroicons/react/24/outline";
import AuthContext from "../../contexts/AuthContext";
import Spinner from "../user_feedback/Spinner";
import SidebarContext from "../../contexts/SidebarContext";
import CartContext from "../../contexts/CartContext";
import CartService from "../../services/cart.service";

// 로그아웃 실패 시 에러 메시지
export default function UserStatus() {
  const navigate = useNavigate();
  const [isSavingCart, setIsSavingCart] = useState(false);

  const authContext = useContext(AuthContext);
  const { toggleSidebar } = useContext(SidebarContext);
  const { clearCart, items } = useContext(CartContext);
  const { accessToken, logout, decodedUser, isAuthLoading } =
    useContext(AuthContext);

  const isLoggedIn = !!accessToken;

  const handleNameClick = () => {
    if (accessToken) {
      navigate("/my-account");
      toggleSidebar();
    } else {
      navigate("/login");
    }
  };

  const currentItems = items.map((i) => ({
    menuId: i.id,
    qty: i.amount,
  }));

  const payload = {
    items: currentItems,
  };

  const persistCart = async () => {
    // const cartService = new CartService(new AbortController(), accessToken);
    const cartService = new CartService(new AbortController(), authContext);

    setIsSavingCart(true);
    try {
      await cartService.saveCart(payload);
    } catch (err) {
      const returnedErrorMsg = err?.response?.data?.error || err.message;
      console.error(returnedErrorMsg);
    } finally {
      setIsSavingCart(false);
    }
  };

  const handleLogout = async () => {
    // await persistCart();
    logout();
    clearCart();
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
