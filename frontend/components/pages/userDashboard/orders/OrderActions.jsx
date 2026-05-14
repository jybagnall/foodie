import { Link } from "react-router-dom";
import { useState } from "react";
import dayjs from "dayjs";
import AlertModal from "../../../UI/AlertModal";

export default function OrderActions({ order, cancelOrder, isCanceling }) {
  const [showAlert, setShowAlert] = useState(false);

  const isCancellable =
    order.status === "paid" &&
    order.payment_status === "succeeded" &&
    dayjs().diff(dayjs(order.created_at), "day") <= 7;

  const canCompleteOrder =
    order.status === "pending" &&
    dayjs().diff(dayjs(order.created_at), "day") < 8;

  return (
    <div className="flex flex-row gap-2 sm:flex-col sm:gap-3 sm:min-w-[140px] mt-0 sm:mt-5">
      <Link
        to={`/my-account/orders/${order.id}`}
        className="flex-1 sm:flex-none text-center border border-gray-300 shadow-md rounded-sm p-3 text-yellow-300 font-bold text-base cursor-pointer"
      >
        Order Details
      </Link>

      {isCancellable && (
        <button
          onClick={() => setShowAlert(true)}
          disabled={isCanceling}
          className="flex-1 sm:flex-none border border-gray-300 shadow-md rounded-sm p-3 text-gray-300 text-base cursor-pointer"
        >
          Cancel Order
        </button>
      )}

      {canCompleteOrder && (
        <button className="flex-1 sm:flex-none border border-gray-300 shadow-md rounded-sm p-3 text-red-400 text-base cursor-pointer">
          Complete Payment
        </button>
      )}

      {showAlert && (
        <AlertModal
          activateFn={() =>
            cancelOrder(order.id, {
              onSuccess: () => setShowAlert(false),
              onError: () => setShowAlert(false),
            })
          }
          isActivating={isCanceling}
          modalIsOpen={showAlert}
          onCancel={() => setShowAlert(false)}
          title="Cancel Order?"
          description="Your payment will be refunded. This may take 5–10 business days to appear in your account."
          userIntentionText="Cancel Order"
        />
      )}
    </div>
  );
}
