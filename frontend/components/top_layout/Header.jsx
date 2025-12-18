import Button from "../UI/Button.jsx";
import CartContext from "../../contexts/CartContext.jsx";
import AuthContext from "../../contexts/AuthContext.jsx";
import { useContext, useState } from "react";
import CartModal from "./CartModal.jsx";
import CurrentCart from "./CurrentCart.jsx";
import UserStatus from "./UserStatus.jsx";

export default function Header() {
  const { numOfItems } = useContext(CartContext);
  const { accessToken, decodedUser } = useContext(AuthContext);
  const [displayCart, setDisplayCart] = useState(false);

  return (
    <>
      {displayCart && (
        <CartModal open={displayCart} onClose={() => setDisplayCart(false)} />
      )}

      {/* <header className="flex justify-between items-center py-6 px-[10%] bg-[#1f2937]"> */}
      <header className="flex justify-between items-center py-12 px-[10%]">
        <div className="flex items-center gap-4">
          <img
            src="/logo.jpg"
            alt="Logo"
            className="w-16 h-16 object-contain rounded-full border-2 border-yellow-300"
          />
          <h1 className="text-2xl font-bold text-yellow-300">Foodie</h1>
        </div>

        <nav className="flex items-center gap-8">
          <UserStatus accessToken={accessToken} decodedUser={decodedUser} />
          <Button
            textOnly
            onClick={() => setDisplayCart(true)}
            propStyle="text-yellow-300 hover:text-yellow-400"
          >
            <CurrentCart numOfItems={numOfItems} />
          </Button>
        </nav>
      </header>
    </>
  );
}
