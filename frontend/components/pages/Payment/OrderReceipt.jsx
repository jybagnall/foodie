// "order/completed/:orderId/receipt";

import { useParams, Link } from "react-router-dom";
import { CheckCircleIcon } from "@heroicons/react/24/solid";
import useOrder from "../../../hooks/useOrder";
import { useEffect } from "react";
import Spinner from "../../user_feedback/Spinner";
import PageError from "../../user_feedback/PageError";
import { currencyFormatter } from "../../../utils/format";

export default function OrderReceipt() {
  const { orderId } = useParams();
  const { order, isOrderFetching, orderFetchingError } = useOrder(orderId);

  useEffect(() => {
    document.title = "Order Receipt | Foodie";
  }, []);

  if (isOrderFetching || !order) return <Spinner />;
  if (orderFetchingError) return <PageError />;

  return (
    <div className="container mx-auto px-4 py-10">
      <div className="max-w-3xl mx-auto">
        <div className="rounded-xl border border-yellow-600 bg-zinc-900 p-8 shadow-lg">
          {/* Header */}
          <div className="text-center border-b border-zinc-700 pb-6">
            <div className="flex justify-center mb-4">
              <CheckCircleIcon className="h-16 w-16 text-green-500" />
            </div>
            <h1 className="text-3xl font-bold text-green-500">Order Receipt</h1>

            <p className="mt-2 text-gray-400">Thank you for your order.</p>

            <p className="mt-4 text-lg font-semibold text-white">
              Order #{order.id}
            </p>
          </div>

          {/* Delivery Address */}
          <div className="mt-8">
            <h2 className="text-lg font-semibold text-yellow-500 mb-3">
              Delivering to
            </h2>

            <div className="rounded-lg border border-zinc-700 bg-zinc-800 p-4">
              <p className="font-medium text-white">
                {order.shipping_full_name}
              </p>

              <p className="text-gray-300 mt-1">{order.shipping_street}</p>

              <p className="text-gray-300">
                {order.shipping_city}, {order.shipping_potal_code}
              </p>
            </div>
          </div>

          {/* Items */}
          <div className="mt-8">
            <h2 className="text-lg font-semibold text-yellow-500 mb-4">
              Order Items
            </h2>

            <div className="space-y-4">
              {order.items.map((i) => (
                <div
                  key={i.id}
                  className="flex items-center gap-4 rounded-lg border border-zinc-700 bg-zinc-800 p-4"
                >
                  <img
                    src={i.image}
                    alt={i.name}
                    className="h-20 w-20 rounded-md object-cover"
                  />

                  <div className="flex-1">
                    <p className="font-medium text-white">{i.name}</p>

                    <p className="text-sm text-gray-400">Quantity: {i.qty}</p>
                  </div>

                  <div className="font-semibold text-white">
                    {currencyFormatter.format(i.price * i.qty)}
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Total */}
          <div className="mt-8 border-t border-zinc-700 pt-6">
            <div className="flex items-center justify-between">
              <span className="text-lg font-medium text-gray-300">Total</span>

              <span className="text-2xl font-bold text-gray-300">
                {currencyFormatter.format(order.total_amount)}
              </span>
            </div>
          </div>

          {/* Actions */}
          <div className="mt-10 flex flex-col gap-3 sm:flex-row">
            <Link
              to="/"
              className="flex-1 rounded-lg bg-gray-200 px-5 py-3 text-center font-medium text-gray-800 transition hover:bg-gray-300"
            >
              Back to Menu
            </Link>

            <Link
              to="/my-account/orders"
              className="flex-1 rounded-lg border border-zinc-600 px-5 py-3 text-center font-medium text-gray-200 transition hover:bg-zinc-800"
            >
              View My Orders
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
