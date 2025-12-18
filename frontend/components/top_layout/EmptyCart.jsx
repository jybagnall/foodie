import { Dialog, DialogBackdrop, DialogPanel } from "@headlessui/react";
import { XMarkIcon, ShoppingCartIcon } from "@heroicons/react/24/outline";
import { useContext } from "react";
import CartContext from "../../contexts/CartContext";

export default function EmptyCart({ open, onClose }) {
  const { numOfCheckedItems } = useContext(CartContext);

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

            <div className="flex flex-col items-center justify-center py-6 text-center text-gray-600">
              <ShoppingCartIcon className="w-24 h-24 text-gray-600" />
              <p className="text-lg font-medium">
                Your cart is currently empty.
              </p>
            </div>

            <div className="flex justify-center items-center -mt-3 pt-4">
              <h2 className="bg-gray-200 hover:bg-gray-300 px-3 py-1 rounded-md text-gray-800">
                Browse menu
              </h2>{" "}
              {/* 🚩🚩🚩 */}
            </div>
          </DialogPanel>
        </div>
      </Dialog>
    </div>
  );
}
