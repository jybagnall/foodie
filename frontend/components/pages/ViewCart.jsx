import { useContext, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { MinusIcon, PlusIcon } from "@heroicons/react/24/outline";
import CartContext from "../../contexts/CartContext";
import EmptyCart from "../top_layout/header/cart/EmptyCart";
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
    deleteItem,
    clearCart,
    toggleCheckedItem,
    setAllChecked,
  } = useContext(CartContext);

  const allChecked = items.every((i) => i.checked);
  const anyChecked = items.some((i) => i.checked);

  const navigate = useNavigate();

  const goToCheckout = () => {
    navigate("/order/shipping");
  };

  useEffect(() => {
    document.title = "Cart | Foodie";
  }, []);

  return (
    <main className="min-h-screen flex justify-center items-start py-20 px-4">
      <div className="w-full max-w-lg">
        {uniqueMenuCount === 0 ? (
          <EmptyCart />
        ) : (
          <>
            <div className="flex justify-between items-center mt-2 mb-4">
              <div className="flex items-center gap-2">
                {/* name attribute는 폼 제출 시 필요함 */}
                {/* <label>의 htmlFor과 id가 연결되면 텍스트 클릭 시 체크박스가 토글됨 */}

                <input
                  checked={allChecked}
                  onChange={(e) => setAllChecked(e.target.checked)}
                  id="all"
                  type="checkbox"
                  aria-label="Select all menu"
                  className="w-5 h-5 cursor-pointer rounded-sm border border-gray-100 checked:bg-gray-400 checked:border-gray-300 transition-colors"
                />
                <label htmlFor="all" className="cursor-pointer text-gray-200">
                  Select all
                  <span className="ml-2 font-semibold">
                    {numOfCheckedItems}
                  </span>
                  /<span className="font-semibold">{uniqueMenuCount}</span>
                </label>
              </div>
            </div>

            <ul className="space-y-2">
              {items.map((i) => (
                <li
                  key={i.id}
                  className="flex items-start gap-x-3 text-gray-200 mt-4"
                >
                  <div className="flex flex-col gap-y-2 w-full">
                    {/* 각 메뉴의 체크박스 */}
                    <div className="flex items-center gap-x-2">
                      <input
                        id={i.name}
                        type="checkbox"
                        checked={i.checked}
                        onChange={() => toggleCheckedItem(i.id)}
                        aria-label={`Select ${i.name}`}
                        className="w-5 h-5 cursor-pointer rounded-sm border border-gray-200 bg-white checked:bg-gray-100 checked:border-gray-100 transition-colors"
                      />
                      <label
                        htmlFor={i.name}
                        className="font-medium text-md cursor-pointer"
                      >
                        {i.name}
                      </label>
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
                              className={`group relative mr-1 ml-0.5 size-3.5 rounded-xs ${
                                i.qty === 1
                                  ? "text-gray-300"
                                  : "text-gray-700 hover:text-gray-900 cursor-pointer"
                              }`}
                              onClick={() => decreaseItem(i.id)}
                            >
                              <MinusIcon className="size-3.5 stroke-current" />
                            </button>
                            {i.qty}
                            <button
                              type="button"
                              className="group relative ml-1 mr-0.5 size-3.5 rounded-xs cursor-pointer"
                              onClick={() => addItem(i)}
                            >
                              <PlusIcon className="size-3.5 stroke-gray-700" />
                            </button>
                          </div>
                          {/* vertical divider */}
                          <div className="h-4 w-px bg-gray-300" />
                          <span
                            onClick={() => deleteItem(i.id)}
                            className="cursor-pointer text-sm text-gray-300 hover:underline"
                          >
                            Delete
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>
                </li>
              ))}
            </ul>

            <div className="flex justify-between items-center mt-6 border-t pt-4 border-gray-300">
              <p className="text-lg font-semibold text-gray-300">
                Total: {currencyFormatter.format(totalAmount)}
              </p>
              <div className="flex gap-2">
                <Button
                  onClick={clearCart}
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
          </>
        )}
      </div>
    </main>
  );
}
