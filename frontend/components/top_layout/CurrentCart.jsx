import { ShoppingCartIcon } from "@heroicons/react/24/outline";
import { useContext } from "react";
import CartContext from "../../contexts/CartContext";

export default function CurrentCart() {
  const { numOfItems } = useContext(CartContext);

  return (
    <div className="relative flex items-center space-x-1 text-white">
      {/* 카트 아이콘 */}
      <div className="relative">
        <ShoppingCartIcon className="w-7 h-7 text-gray-200" />

        {/* 수량 뱃지 */}
        <span
          className="
            absolute -top-2 -right-2
             text-orange-500 text-sm font-bold
            rounded-full w-5 h-5 flex items-center justify-center
          "
        >
          {numOfItems}
        </span>
      </div>

      {/* 텍스트 */}
      <span className="text-sm font-medium text-gray-100">Cart</span>
    </div>
  );
}
