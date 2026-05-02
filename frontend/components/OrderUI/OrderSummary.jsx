import { currencyFormatter } from "../../utils/format";

export default function OrderSummary({ order }) {
  return (
    <div className="border rounded-lg p-5 border-gray-300 text-gray-400">
      <p className="font-semibold mb-4 text-gray-200">Order summary</p>

      <div className="flex justify-between text-sm mb-2">
        <span>Subtotal</span>
        <span>{currencyFormatter.format(order.total_amount)}</span>
      </div>

      <div className="flex justify-between text-sm mb-2">
        <span>Shipping</span>
        <span>Free</span>
      </div>

      <div className="flex justify-between text-sm mb-4">
        <span>Tax</span>
        <span>₩0</span>
      </div>

      <div className="border-t pt-3 flex justify-between font-semibold text-gray-200">
        <span>Order total</span>
        <span>{currencyFormatter.format(order.total_amount)}</span>
      </div>

      <div className="mt-3 text-green-500 text-sm">You saved ₩21,210</div>
    </div>
  );
}
