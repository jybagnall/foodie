import { useNavigate } from "react-router-dom";
import { ShoppingCartIcon } from "@heroicons/react/24/outline";
import useCancelOrder from "../../../hooks/order/useCancelOrder";
import Button from "../../UI/Button";

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

      <Button
        type="button"
        variant="text"
        disabled={isCanceling}
        onClick={handleGoBack}
        className="gap-2 text-sm text-gray-400 hover:text-gray-300 mr-3"
      >
        <ShoppingCartIcon className="w-7 h-7" />
        <span>Go back to cart</span>
      </Button>
    </div>
  );
}
