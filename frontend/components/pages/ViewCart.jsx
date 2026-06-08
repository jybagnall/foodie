import { useContext, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import CartContext from "../../contexts/CartContext";
import EmptyCart from "../top_layout/header/cart/EmptyCart";
import Button from "../UI/Button";
import { currencyFormatter } from "../../utils/format";
import useServerCart from "../../hooks/useServerCart";
import useServerCartActions from "../../hooks/useServerCartActions";
import useGuestCartActions from "../../hooks/useGuestCartActions";
import CartHeader from "../ShoppingCartUI/CartHeader";
import CartList from "../ShoppingCartUI/CartList";
import PriceSummary from "../ShoppingCartUI/PriceSummary";

export default function ViewCart() {
  const {
    items,
    mode,
    totalItemCount,
    checkedItemQty,
    totalAmount,
    subTotalAmount,
    deliveryFee,
    selectedItemIds,
    toggleCheckedItem,
    toggleAllSelections,
  } = useContext(CartContext);

  const { isUpdatingServerCart } = useServerCart();
  const serverActions = useServerCartActions();
  const guestActions = useGuestCartActions();

  const actions = mode === "server" ? serverActions : guestActions;

  const allChecked = items.length > 0 && selectedItemIds.size === items.length;
  const anyChecked = selectedItemIds.size > 0;

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
    <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="mx-auto max-w-5xl">
        <div className="rounded-2xl border rounded-lg border-2 border-gray-300 shadow-sm">
          <div className="p-6 md:p-8">
            <CartHeader
              allChecked={allChecked}
              toggleAllSelections={toggleAllSelections}
              checkedItemQty={checkedItemQty}
              totalItemCount={totalItemCount}
            />

            {/* Main Layout */}
            <div className="mt-8 grid grid-cols-1 gap-8 lg:grid-cols-3">
              {/* LEFT SIDE */}
              <div className="lg:col-span-2">
                <CartList
                  items={items}
                  toggleCheckedItem={toggleCheckedItem}
                  selectedItemIds={selectedItemIds}
                  decreaseItem={actions.decreaseItem}
                  addItem={actions.addItem}
                  deleteItem={actions.deleteItem}
                  isUpdatingServerCart={isUpdatingServerCart}
                />
              </div>

              {/* RIGHT SIDE */}
              <div className="lg:col-span-1">
                <div className="sticky top-6 rounded-2xl border border-gray-200 bg-gray-700 p-6 shadow-sm">
                  <h3 className="mb-6 text-lg font-semibold text-gray-200">
                    Order Summary
                  </h3>

                  <PriceSummary
                    subTotalAmount={subTotalAmount}
                    deliveryFee={deliveryFee}
                    totalAmount={totalAmount}
                  />

                  <div className="mt-6 space-y-3">
                    <Button
                      onClick={goToCheckout}
                      disabled={!anyChecked}
                      className="w-full h-11 rounded-xl bg-yellow-400 text-gray-900 font-semibold hover:bg-yellow-500 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      Proceed to Checkout
                    </Button>

                    <Button
                      onClick={actions.clearCart}
                      variant="outline"
                      className="w-full h-11 rounded-xl border-gray-300 text-gray-200 bg-gray-500 hover:bg-gray-600"
                    >
                      Clear Cart
                    </Button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
