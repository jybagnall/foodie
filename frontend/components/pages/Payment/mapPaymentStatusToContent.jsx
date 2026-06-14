import { Link } from "react-router-dom";
import Spinner from "../../user_feedback/Spinner";

// UI 데이터 생성기
export function mapPaymentStatusToContent(status, paymentErr, orderId) {
  const retryLink = (
    <Link
      to={`/order/payment/${orderId}`}
      state={{ retry: true }}
      className="text-orange-400 underline"
    >
      Try Again
    </Link>
  );

  const viewOrdersPage = (
    <Link to={"/my-account/orders"} className="text-orange-400 underline">
      Go to My Orders
    </Link>
  );

  const backToMenuLink = (
    <Link to="/" className="text-gray-300 underline">
      Back to Menu
    </Link>
  );

  const viewReceiptPage = (
    <Link
      to={`/order/completed/${orderId}/receipt`}
      className="text-yellow-500 underline"
    >
      View Order
    </Link>
  );

  const returnToCart = (
    <Link to="/cart" className="text-orange-400 underline">
      Return to Cart
    </Link>
  );

  switch (status) {
    case "loading":
      return {
        title: "Checking payment...",
        message: "Please wait while we confirm your payment.",
        action: <Spinner />,
      };
    case "processing":
      return {
        title: "Finalizing your payment...",
        message:
          "Your payment is being processed. Please stay on this page for a moment.",
        action: <Spinner />,
      };
    case "processing_timeout":
      return {
        title: "Almost there!",
        message:
          "Your payment is taking longer than usual. You can check your order status shortly.",
        action: viewOrdersPage,
      };
    case "canceled":
      return {
        title: "Payment canceled",
        message:
          paymentErr || "Your payment was canceled and no charge was made.",
        action: viewOrdersPage,
      };
    case "succeeded":
      return {
        title: "Order confirmed!",
        message: `Your order #${orderId} has been successfully placed.`,
        action: (
          <div className="flex flex-col gap-2">
            {viewReceiptPage}
            {backToMenuLink}
          </div>
        ),
      };
    case "requires_payment_method":
      return {
        title: "Payment failed",
        message:
          paymentErr ||
          "Your payment could not be completed. Please try another payment method.",
        action: retryLink,
      }; // 카드 문제
    case "invalid_payment":
      return {
        title: "We couldn't confirm your payment",
        message:
          "Please check your order status or try again in a few moments.",
        action: viewOrdersPage,
      }; // suspicious/bad request
    case "server_error":
      return {
        title: "Verification unavailable",
        message:
          "We're having trouble confirming your payment right now. Please check your orders page shortly.",
        action: viewOrdersPage,
      }; // server/system issue
    default:
      return {
        title: "Something went wrong",
        message:
          paymentErr ||
          "We couldn't verify your payment. Please try again shortly.",
        action: returnToCart,
      };
  }
}
