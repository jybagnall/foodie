import { useContext, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { MinusIcon, PlusIcon, XMarkIcon } from "@heroicons/react/24/outline";
import CartContext from "../../contexts/CartContext";
import EmptyCart from "../top_layout/EmptyCart";
import Button from "../UI/Button";
import { currencyFormatter } from "../../utils/format";

export default function ViewCart() {
  const {
    items,
    uniqueMenuCount,
    numOfCheckedItems,
    totalAmount,
    addItem,
    decreaseItem,
    clearCart,
    toggleCheckedItem,
    setAllChecked,
  } = useContext(CartContext);

  const allChecked = items.every((i) => i.checked);

  const navigate = useNavigate();

  if (uniqueMenuCount === 0) {
    return <EmptyCart />;
  }

  const goToCheckout = () => {
    navigate("/order/shipping");
  };

  useEffect(() => {
    document.title = "Cart | Foodie";
  }, []);

  return (
    <main className="min-h-screen flex justify-center items-start bg-gray-50 py-20 px-4">
      <div className="w-full max-w-lg">
        <div className="flex justify-between items-center mt-2 mb-4 pt-4">
          <div className="flex items-center gap-2">
            <input
              checked={allChecked}
              onChange={(e) => setAllChecked(e.target.checked)}
              id="all"
              name="all"
              type="checkbox"
              aria-describedby="checkbox to select all"
              className="w-5 h-5 cursor-pointer rounded-sm border border-gray-500 bg-white 
                     checked:bg-gray-300 checked:border-gray-300 transition-colors"
            />

            <h3>
              Select all{" "}
              <span className="ml-2 font-semibold">{numOfCheckedItems}</span>/
              <span className="font-semibold">{uniqueMenuCount}</span>
            </h3>
          </div>
        </div>

        <ul className="space-y-2">
          {items.map((i) => (
            <li
              key={i.id}
              className="flex items-start gap-x-3 text-gray-700 mt-4"
            >
              <div className="flex flex-col gap-y-2 w-full">
                {/* 체크박스, 이름 */}
                <div className="flex items-center gap-x-2">
                  <input
                    id={i.name}
                    name={i.name}
                    type="checkbox"
                    checked={i.checked}
                    onChange={() => toggleCheckedItem(i.id)}
                    aria-describedby="checkbox to select all"
                    className="w-5 h-5 cursor-pointer rounded-sm border border-gray-500 bg-white
                  checked:bg-gray-300 checked:border-gray-300 transition-colors"
                  />
                  <span className="font-medium text-md">{i.name}</span>
                </div>

                <div className="flex items-center gap-x-4 ml-7">
                  <img
                    src={i.image}
                    alt={i.name}
                    className="w-18 h-18 rounded-md object-cover"
                  />

                  <div className="flex flex-col gap-y-2">
                    <span className="text-sm font-semibold">
                      {currencyFormatter.format(i.price * i.qty)}
                    </span>

                    <div className="flex items-center gap-x-4">
                      <div className="inline-flex items-center gap-x-0.5 rounded-md bg-gray-100 px-2 py-1 text-xs font-medium text-gray-600">
                        <button
                          type="button"
                          className="group relative mr-1 ml-0.5 size-3.5 rounded-xs cursor-pointer"
                          onClick={() => decreaseItem(i.id)}
                        >
                          <MinusIcon className="size-3.5 stroke-gray-700 hover:gray-700" />
                        </button>
                        {i.qty}
                        <button
                          type="button"
                          className="group relative ml-1 mr-0.5 size-3.5 rounded-xs cursor-pointer"
                          onClick={() => addItem(i)}
                        >
                          <PlusIcon className="size-3.5 stroke-gray-700 hover:gray-700" />
                        </button>
                      </div>
                      {/* vertical divider */}
                      <div className="h-4 w-px bg-gray-300" />
                      <span className="cursor-pointer text-sm text-blue-600 hover:underline">
                        Delete
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            </li>
          ))}
        </ul>

        <div className="flex justify-between items-center mt-6 border-t pt-4">
          <p className="text-lg font-semibold">
            Total: {currencyFormatter.format(totalAmount)}
          </p>
          <div className="flex gap-2">
            <Button
              onClick={clearCart}
              className="bg-gray-200 hover:bg-gray-300 px-3 py-1 rounded-md text-gray-800 cursor-pointer"
            >
              Clear
            </Button>{" "}
            {/* 🚩🚩🚩 */}
            <Button
              onClick={goToCheckout}
              disabled={numOfCheckedItems === 0}
              className="bg-yellow-300 hover:bg-yellow-400 px-3 py-1 rounded-md text-gray-900 disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
            >
              Proceed to checkout
            </Button>{" "}
            {/* 🚩🚩🚩 */}
          </div>
        </div>
      </div>
    </main>
  );
}
