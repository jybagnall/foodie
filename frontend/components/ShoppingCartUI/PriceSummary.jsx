import { currencyFormatter } from "../../utils/format";

export default function PriceSummary({
  subTotalAmount,
  deliveryFee,
  totalAmount,
}) {
  return (
    <>
      <div className="space-y-3">
        <div className="flex items-center justify-between text-sm text-gray-300">
          <span>Subtotal</span>
          <span className="font-medium text-gray-300">
            {currencyFormatter.format(subTotalAmount)}
          </span>
        </div>

        <div className="flex items-center justify-between text-sm text-gray-300">
          <span>Shipping</span>
          <span className="font-medium text-gray-300">
            {currencyFormatter.format(deliveryFee)}
          </span>
        </div>

        <div className="flex items-center justify-between text-sm text-gray-300">
          <span>Tax</span>
          <span className="font-medium text-gray-400 italic">
            Calculated at checkout
          </span>
        </div>
      </div>

      <div className="my-5 border-t border-gray-200" />

      <div className="flex items-center justify-between">
        <span className="text-base font-semibold text-gray-200">Total</span>
        <span className="text-2xl font-bold text-gray-200">
          {currencyFormatter.format(totalAmount)}
        </span>
      </div>
    </>
  );
}
