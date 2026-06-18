import { Link, useNavigate } from "react-router-dom";
import { ShoppingCartIcon } from "@heroicons/react/24/outline";
import useCancelOrder from "../../../hooks/useCancelOrder";

export default function PaymentHeader({ orderId }) {
  const { cancelOrder, isCanceling } = useCancelOrder(orderId);
  const navigate = useNavigate();

  const handleGoBack = () => {
    cancelOrder(orderId, {
      onSuccess: () => navigate("/cart"),
      onError: () => navigate("/cart"),
    });
  };

  return (
    <div className="flex items-center justify-between mb-6 pb-3 border-b">
      <h2 className="text-2xl font-semibold text-gray-200">Payment method</h2>

      <button
        disabled={isCanceling}
        onClick={handleGoBack}
        className="flex items-center gap-2 text-sm text-gray-400 transition-colors hover:text-gray-300 mr-3"
      >
        <ShoppingCartIcon className="w-7 h-7" />
        <span>Go back to cart</span>
      </button>
    </div>
  );
}
