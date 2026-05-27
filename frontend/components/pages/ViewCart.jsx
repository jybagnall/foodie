import { useContext, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import CartContext from "../../contexts/CartContext";
import EmptyCart from "../top_layout/header/cart/EmptyCart";
import Button from "../UI/Button";
import { currencyFormatter } from "../../utils/format";
import useServerCart from "../../hooks/useServerCart";
import useCartActions from "../../hooks/useCartActions";
import CartHeader from "../ShoppingCartUI/CartHeader";
import CartList from "../ShoppingCartUI/CartList";

export default function ViewCart() {
  const {
    items,
    totalItemCount,
    checkedItemQty,
    totalAmount,
    toggleCheckedItem,
    setAllChecked,
  } = useContext(CartContext);

  const { isUpdatingServerCart } = useServerCart();
  const {
    addItemAndSync,
    decreaseItemAndSync,
    clearCartAndSync,
    deleteItemAndSync,
  } = useCartActions();

  const allChecked = items.every((i) => i.checked);
  const anyChecked = items.some((i) => i.checked);

  const navigate = useNavigate();

  const goToCheckout = () => {
    navigate("/order/shipping");
  };

  useEffect(() => {
    document.title = "Cart | Foodie";
  }, []);

  if (totalItemCount === 0) {
    return (
      <main className="min-h-screen flex justify-center items-start py-20 px-4">
        <div className="w-full max-w-lg">
          <EmptyCart />
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen flex justify-center items-start py-20 px-4">
      <div className="w-full max-w-lg">
        <CartHeader
          allChecked={allChecked}
          setAllChecked={setAllChecked}
          checkedItemQty={checkedItemQty}
          totalItemCount={totalItemCount}
        />

        <CartList
          items={items}
          toggleCheckedItem={toggleCheckedItem}
          decreaseItemAndSync={decreaseItemAndSync}
          addItemAndSync={addItemAndSync}
          deleteItemAndSync={deleteItemAndSync}
          isUpdatingServerCart={isUpdatingServerCart}
        />

        <div className="flex justify-between items-center mt-6 border-t pt-4 border-gray-300">
          <p className="text-lg font-semibold text-gray-300">
            Total: {currencyFormatter.format(totalAmount)}
          </p>
          <div className="flex gap-2">
            <Button
              onClick={clearCartAndSync}
              className="bg-gray-200 hover:bg-gray-300 px-3 py-1 rounded-md text-gray-800 cursor-pointer"
            >
              Clear
            </Button>{" "}
            <Button
              onClick={goToCheckout}
              disabled={!anyChecked}
              className="bg-yellow-300 hover:bg-yellow-400 px-3 py-1 rounded-md text-gray-900 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Proceed to checkout
            </Button>{" "}
          </div>
        </div>
      </div>
    </main>
  );
}
