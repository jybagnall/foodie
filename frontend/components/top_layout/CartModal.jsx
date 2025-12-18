import { Dialog, DialogBackdrop, DialogPanel } from "@headlessui/react";
import { XMarkIcon, PlusIcon, MinusIcon } from "@heroicons/react/24/outline";
import { useContext, useEffect } from "react";
import { useNavigate } from "react-router-dom";

import CartContext from "../../contexts/CartContext";
import { currencyFormatter } from "../../utils/format";
import Button from "../UI/Button";
import EmptyCart from "./EmptyCart";

// 컨텍스트에서 로그인 함수를 빼다가 쓸 것
export default function CartModal({ open, onClose }) {
  const {
    items,
    numOfItems,
    numOfCheckedItems,
    totalAmount,
    addItem,
    removeItem,
    clearCart,
    toggleCheckedItem,
    setAllChecked,
  } = useContext(CartContext);

  const allChecked = items.every((i) => i.checked);

  const navigate = useNavigate();

  if (numOfItems === 0) {
    return <EmptyCart open={open} onClose={onClose} />;
  }

  const goToCheckout = () => {
    onClose(); // 모달 닫기
    navigate("/checkout"); // 페이지 이동
  };

  useEffect(() => {
    document.title = "Cart | Foodie";
  }, []);

  return (
    <div>
      <Dialog open={open} onClose={onClose} className="relative z-10">
        <DialogBackdrop className="fixed inset-0 bg-gray-900/50 transition-opacity" />

        <div className="fixed inset-0 flex items-center justify-center p-4">
          <DialogPanel className="bg-white p-6 rounded-lg shadow-lg w-[90%] max-w-md">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-bold text-gray-800">Your Cart</h2>
              <button onClick={onClose}>
                <XMarkIcon className="size-6 text-gray-500 hover:text-gray-700" />
              </button>
            </div>

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
                {/* ✅✅✅ */}
                <h3>
                  Select all{" "}
                  <span className="ml-2 font-semibold">
                    {numOfCheckedItems}
                  </span>
                  /<span className="font-semibold">{numOfItems}</span>
                </h3>
              </div>
              <Button propStyle="py-0.5 px-2 bg-white border-gray-300 hover:bg-gray-50">
                Remove
              </Button>{" "}
              {/* 🚩🚩🚩 */}
            </div>

            <ul className="space-y-3">
              {items.map((i) => (
                <li
                  key={i.id}
                  className="flex justify-between items-center text-gray-700"
                >
                  <div className="flex items-center">
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
                    <span className="ml-2">
                      {i.name}

                      <span className="inline-flex items-center gap-x-0.5 rounded-md bg-gray-100 px-2 py-1 text-xs font-medium text-gray-600">
                        <button
                          type="button"
                          className="group relative mr-1 ml-0.5 size-3.5 rounded-xs"
                          onClick={() => removeItem(i.id)}
                        >
                          <MinusIcon className="size-3.5 stroke-gray-700 hover:gray-700" />
                        </button>
                        {i.amount}
                        <button
                          type="button"
                          className="group relative ml-1 mr-0.5 size-3.5 rounded-xs"
                          onClick={() => addItem(i)}
                        >
                          <PlusIcon className="size-3.5 stroke-gray-700 hover:gray-700" />
                        </button>
                      </span>
                    </span>
                  </div>
                  <span>{currencyFormatter.format(i.price * i.amount)}</span>
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
                  className="bg-gray-200 hover:bg-gray-300 px-3 py-1 rounded-md text-gray-800"
                >
                  Clear
                </Button>{" "}
                {/* 🚩🚩🚩 */}
                <Button
                  onClick={goToCheckout}
                  disabled={numOfCheckedItems === 0}
                  className="bg-yellow-300 hover:bg-yellow-400 px-3 py-1 rounded-md text-gray-900 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Proceed to checkout
                </Button>{" "}
                {/* 🚩🚩🚩 */}
              </div>
            </div>
          </DialogPanel>
        </div>
      </Dialog>
    </div>
  );
}
// React의 기본 <button>은 disabled={true}면 비활성화되지만,
// 커스텀 버튼은 스타일을 넘겨줘야 함.
