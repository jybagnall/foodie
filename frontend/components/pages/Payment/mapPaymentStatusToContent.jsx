import { Link } from "react-router-dom";
import Spinner from "../../user_feedback/Spinner";

// UI 데이터 생성기
export function mapPaymentStatusToContent(status, orderId) {
  const retryLink = (
    <Link
      to={`/order/payment/${orderId}`}
      state={{ retry: true }}
      className="text-orange-400 underline"
    >
      Try again
    </Link>
  );

  switch (status) {
    case "loading":
      return {
        title: "Checking payment...",
        message: "Please wait while we verify your payment.",
        action: <Spinner />,
      };
    case "processing":
      return {
        title: "Processing your payment...",
        message:
          "Please do not leave this page. Your payment is being confirmed.",
        action: <Spinner />,
      };
    case "succeeded":
      return {
        title: "Payment successful!",
        message: `Your order #${orderId} has been confirmed.`,
        action: (
          <Link to="/" className="text-orange-400 underline">
            Back to home
          </Link>
        ),
      };
    case "requires_payment_method":
      return {
        title: "Payment failed",
        message: "Please try another payment method.",
        action: retryLink,
      }; // 카드 문제
    case "failed":
      return {
        title: "Payment failed",
        message:
          "We couldn't process your payment. Please try again or use a different method.",
        action: retryLink,
      };
    default:
      return {
        title: "Something went wrong",
        message: "We couldn't complete your payment. Please try again.",
        action: (
          <Link to="/cart" className="text-orange-400 underline">
            Return to cart
          </Link>
        ),
      };
  }
}
