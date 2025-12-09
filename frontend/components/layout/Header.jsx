import Button from "../UI/Button.jsx";
import CartContext from "../../contexts/CartContext.jsx";
import { useContext, useState } from "react";
import CartModal from "../top_layout/CartModal.jsx";

export default function Header() {
  const { numOfItems } = useContext(CartContext);
  const [displayCart, setDisplayCart] = useState(false);

  return (
    <>
      {displayCart && (
        <CartModal open={displayCart} onClose={() => setDisplayCart(false)} />
      )}

      <header className="flex justify-between items-center py-12 px-[10%]">
        <div className="flex items-center gap-4">
          <img
            src="/logo.jpg"
            alt="Logo"
            className="w-16 h-16 object-contain rounded-full border-2 border-yellow-300"
          />
          <h1 className="text-2xl font-bold text-yellow-300">Foodie</h1>
        </div>
        <nav>
          <Button
            textOnly
            onClick={() => setDisplayCart(true)}
            propStyle="text-yellow-300 hover:text-yellow-400"
          >
            Cart({numOfItems} )
          </Button>
        </nav>
      </header>
    </>
  );
}
