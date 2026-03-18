import {
  Link,
  useLocation,
  useParams,
  useSearchParams,
} from "react-router-dom";
import Spinner from "./Spinner";
import { useContext, useEffect, useState } from "react";
import PaymentService from "../../services/payment.service";
import AuthContext from "../../contexts/AuthContext";

// GET /order/order-completed/orderId
//
export default function OrderConfirmation() {
  const paymentIntentId = searchParams.get("payment_intent");
  const { orderId } = useParams();
  const [searchParams] = useSearchParams();
  const [status, setStatus] = useState(paymentIntentId ? "loading" : "error");
  const { accessToken } = useContext(AuthContext);

  useEffect(() => {
    if (!paymentIntentId) {
      return;
    }

    const paymentService = new PaymentService(
      new AbortController(),
      () => accessToken,
    );

    const verifyStatus = async () => {
      try {
        const { status } = await paymentService.verifyPayment(paymentIntentId);
        setStatus(status);
      } catch {
        setStatus("error");
      }
    };

    verifyStatus();
  }, [paymentIntentId]);

  // 실수로 페이지를 벗어나는 것을 방지
  useEffect(() => {
    if (status !== "processing") return; // 결제 처리 중에만 동작

    const handleBeforeUnload = (e) => {
      e.preventDefault(); // 브라우저가 페이지를 나갈 때 실행
      e.returnValue = ""; // 브라우저가 경고창을 띄움
    };

    window.addEventListener("beforeunload", handleBeforeUnload); // 브라우저 나감 감지

    // 이전 이벤트 제거
    return () => window.removeEventListener("beforeunload", handleBeforeUnload);
  }, [status]);

  const getContent = () => {
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
          action: <Link to={`/order/pay-order/${orderId}`}>Try again</Link>,
        };
      case "failed":
        return {
          title: "Payment failed",
          message:
            "We couldn't process your payment. Please try again or use a different method.",
          action: (
            <Link
              to={`/order/pay-order/${orderId}`}
              className="text-orange-400 underline"
            >
              Try again
            </Link>
          ),
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
  };

  const { title, message, action } = getContent(); // 상태에 따른 객체가 반환됨.

  return (
    <div className="text-center p-20">
      <h1 className="text-2xl font-bold mb-5">{title}</h1>
      <p className="text-xl font-semibold mb-5">{message}</p>
      {action}
    </div>
  );
}
