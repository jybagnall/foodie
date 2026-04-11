import {
  formatDateOnly,
  formatOrderStatus,
  formatPaymentStatus,
} from "../../../../utils/format";

// 결제가 실패했거나 대기 중이면 → payment_status 우선
// 결제가 완료됐으면 → order_status

export default function OrderHeader({ order }) {
  const displayStatus =
    order.payment_status !== "succeeded"
      ? formatPaymentStatus(order.payment_status)
      : formatOrderStatus(order.status);

  return (
    <div className="pb-2 sm:pb-3">
      <div className="flex justify-between items-center">
        <p className="font-semibold text-lg">Order #{order.id}</p>
        <span className="text-sm px-3 py-1 rounded-full bg-gray-500">
          {displayStatus}
        </span>
      </div>
      <p className="text-sm text-gray-300">
        Placed on {formatDateOnly(order.created_at)}
      </p>
    </div>
  );
}
