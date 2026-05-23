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
      Try again
    </Link>
  );

  const viewOrdersPage = (
    <Link to={"/my-account/orders"} className="text-orange-400 underline">
      View orders page
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
    case "processing_timeout":
      return {
        title: "Almost there!",
        message:
          "Your payment is taking longer than usual. Check your orders page in a moment.",
        action: viewOrdersPage,
      };
    case "canceled":
      return {
        title: "Payment canceled",
        message: paymentErr || "Your payment was canceled.",
        action: viewOrdersPage,
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
        message: paymentErr || "Please try another payment method.",
        action: retryLink,
      }; // 카드 문제
    case "invalid_payment":
      return {
        title: "Unable to verify payment",
        message: "This payment session is no longer valid.",
        action: viewOrdersPage,
      }; // suspicious/bad request
    case "server_error":
      return {
        title: "Verification unavailable",
        message: "We're having trouble verifying your payment right now.",
        action: viewOrdersPage,
      }; // server/system issue
    default:
      return {
        title: "Something went wrong",
        message:
          paymentErr || "Something went wrong while verifying your payment.",
        action: (
          <Link to="/cart" className="text-orange-400 underline">
            Return to cart
          </Link>
        ),
      };
  }
}
