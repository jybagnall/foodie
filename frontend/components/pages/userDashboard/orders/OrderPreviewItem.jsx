import { currencyFormatter } from "../../../../utils/format";

export default function OrderPreviewItem({ item, showPrice = false }) {
  return (
    <div className="flex gap-4 mb-6">
      <img src={item.image} className="w-30 h-30 object-cover" />
      <div className="flex-1">
        <p>{item.name}</p>
        {showPrice && (
          <p className="text-sm text-red-400">
            {currencyFormatter.format(item.price)}
          </p>
        )}
        <p className="text-sm">Qty: {item.qty}</p>

        <div className="mt-5 flex gap-2">
          <button className="border px-3 py-1 rounded whitespace-nowrap">
            Buy again
          </button>
          <button className="border px-3 py-1 rounded whitespace-nowrap">
            Write a Review
          </button>
        </div>
      </div>
    </div>
  );
}
