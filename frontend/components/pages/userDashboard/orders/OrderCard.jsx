import { ChevronDownIcon } from "@heroicons/react/24/outline";
import { useState } from "react";

import OrderHeader from "./OrderHeader";
import OrderPreviewItem from "./OrderPreviewItem";
import OrderActions from "./OrderActions";

export default function OrderCard({ order }) {
  const [expanded, setExpanded] = useState(false);
  const visibleItems = expanded
    ? order.preview_items
    : order.preview_items.slice(0, 3);

  return (
    <div className="w-full rounded-lg border-2 border-gray-400 p-6 text-left mt-5">
      <OrderHeader order={order} />

      <div className="flex flex-col gap-4 sm:flex-row sm:items-start">
        <div className="flex-1 p-4 sm:p-6 flex flex-col gap-3 shadow-lg rounded-lg">
          {visibleItems.map((item) => (
            <OrderPreviewItem key={item.name} item={item} />
          ))}

          {order.item_count > 3 && (
            <button
              onClick={() => setExpanded((prev) => !prev)}
              className="mt-4 ml-4 inline-flex items-center gap-1 whitespace-nowrap text-gray-200 hover:text-yellow-400 cursor-pointer"
            >
              {expanded ? "Show less" : `See all ${order.item_count} items`}
              <ChevronDownIcon
                className={`w-4 h-4 mt-1 transition-transform ${expanded ? "rotate-180" : ""}`}
              />
            </button>
          )}
        </div>

        <OrderActions order={order} />
      </div>
    </div>
  );
}
