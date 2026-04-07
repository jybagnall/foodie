import { formatDateOnly } from "../../../../utils/format";

export default function OrderHeader({ order }) {
  return (
    <div className="pb-2 sm:pb-3">
      <div className="flex justify-between items-center">
        <p className="font-semibold text-lg">Order #{order.id}</p>
        <span className="text-sm px-3 py-1 rounded-full bg-gray-500">
          {order.payment_status}
        </span>
      </div>
      <p className="text-sm text-gray-300">
        Placed on {formatDateOnly(order.created_at)}
      </p>
    </div>
  );
}
