import { MinusIcon, PlusIcon, TrashIcon } from "@heroicons/react/24/outline";
import { currencyFormatter } from "../../utils/format";

export default function CartList({
  items,
  toggleCheckedItem,
  selectedItemIds,
  decreaseItem,
  addItem,
  deleteItem,
  isUpdatingServerCart,
}) {
  return (
    <ul className="space-y-2">
      {items.map((i) => (
        <li key={i.id} className="flex items-start gap-x-3 text-gray-200 mt-4">
          <div className="flex flex-col gap-y-2 w-full">
            {/* 각 메뉴의 체크박스 */}
            <div className="flex items-center gap-x-2">
              <input
                id={i.name}
                type="checkbox"
                checked={selectedItemIds.has(i.id)}
                onChange={() => toggleCheckedItem(i.id)}
                aria-label={`Select ${i.name}`}
                className="w-5 h-5 cursor-pointer rounded-sm border border-gray-200 bg-white checked:bg-gray-100 checked:border-gray-100 transition-colors"
              />
              <label
                htmlFor={i.name}
                className="font-medium text-lg cursor-pointer"
              >
                {i.name}
              </label>
            </div>

            <div className="flex items-center gap-x-4 ml-7">
              <img
                src={i.image}
                alt={i.name}
                className="w-22 h-22 rounded-md object-cover"
              />

              <div className="flex flex-col gap-y-2">
                <span className="text-md font-semibold">
                  {currencyFormatter.format(i.price * i.qty)}
                </span>

                <div className="flex items-center gap-x-4">
                  <div className="inline-flex items-center gap-x-0.5 rounded-md bg-gray-100 px-2 py-1 text-sm font-medium text-gray-600">
                    <button
                      type="button"
                      onClick={() => decreaseItem(i)}
                      disabled={isUpdatingServerCart}
                      className="text-gray-700 hover:text-gray-900 cursor-pointer relative mr-1 ml-0.5 size-3.5 rounded-xs"
                    >
                      {i.qty === 1 ? (
                        <TrashIcon className="size-3.5" />
                      ) : (
                        <MinusIcon className="size-3.5 stroke-current" />
                      )}
                    </button>
                    {i.qty}
                    <button
                      type="button"
                      onClick={() => addItem(i)}
                      disabled={isUpdatingServerCart}
                      className="group relative ml-1 mr-0.5 size-3.5 rounded-xs cursor-pointer"
                    >
                      <PlusIcon className="size-3.5 stroke-gray-700" />
                    </button>
                  </div>
                  {/* vertical divider */}
                  <div className="h-4 w-px bg-gray-300" />
                  <span
                    onClick={() => deleteItem(i)}
                    className="cursor-pointer text-md text-gray-300 hover:underline"
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
  );
}
