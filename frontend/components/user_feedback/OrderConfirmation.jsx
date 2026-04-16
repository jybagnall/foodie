import {
  Link,
  useLocation,
  useNavigate,
  useParams,
  useSearchParams,
} from "react-router-dom";
import Spinner from "./Spinner";
import { useContext, useEffect, useRef, useState } from "react";
import PaymentService from "../../services/payment.service";
import CartContext from "../../contexts/CartContext";
import { clearFromPayment, getFromPayment } from "../../storage/paymentStorage";
import useAccessToken from "../../hooks/useAccessToken";

// GET /order/completed/orderId?payment_intent=

export default function OrderConfirmation() {
  const location = useLocation();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const paymentIntentId = searchParams.get("payment_intent");
  const abortControllerRef = useRef(null);
  const redirectStatus = location.state?.status; // "succeeded", "failed", undefined
  const { orderId } = useParams();
  const [status, setStatus] = useState(() => {
    if (redirectStatus === "succeeded") return "succeeded";
    if (redirectStatus === "failed") return "failed";
    return paymentIntentId ? "loading" : "error";
  });
  const accessToken = useAccessToken();
  const { clearCart } = useContext(CartContext);

  useEffect(() => {
    if (status === "succeeded") {
      document.title = "Order Confirmed | Foodie";
    } else if (status === "failed" || status === "requires_payment_method") {
      document.title = "Payment Failed | Foodie";
    } else {
      document.title = "Order Confirmation | Foodie";
    }
  }, [status]);

  useEffect(() => {
    if (!paymentIntentId) {
      return;
    }

    if (redirectStatus === "succeeded") {
      clearCart();
      return; // 3DS 성공
    }

    abortControllerRef.current?.abort();
    abortControllerRef.current = new AbortController();
    const paymentService = new PaymentService(
      abortControllerRef.current.signal,
      () => accessToken,
    );

    const verifyStatus = async () => {
      try {
        const { status } = await paymentService.verifyPayment(paymentIntentId);
        setStatus(status);

        if (status === "succeeded") {
          clearCart();
        }
      } catch {
        setStatus("error");
      }
    };

    verifyStatus();

    return () => abortControllerRef.current?.abort();
  }, [paymentIntentId]);

  // 결제 페이지가 state: { from: "payment" }을 보냄
  // 이 페이지는 결제 페이지에서만 도착 가능, 그외는 튕겨냄
  useEffect(() => {
    const isFromPayment = getFromPayment();

    if (location.state?.from !== "payment" && !isFromPayment) {
      navigate(`/my-account/orders`, { replace: true });
      return;
    } // 1. 다른 곳에서 뒤로가기로 재진입 시, 주문 내역 페이지로 튕겨냄

    // 정상적으로 결제하고 들어온 경우에 실행
    // 2. 현재 URL을 히스토리에 한 번 더 추가 (완료 페이지가 2개), 즉
    // [결제창 페이지] → [결제 완료] → [결제 완료(카피), 유저 위치함]
    window.history.pushState(null, "", window.location.href);

    // 3. [결제 완료 복사본] → [결제 완료 페이지] → 튕겨짐
    const handlePopstate = () =>
      navigate(`/my-account/orders/${orderId}`, { replace: true });
    window.addEventListener("popstate", handlePopstate);

    // 4. 페이지 떠날 때 이벤트 리스너 정리
    return () => {
      window.removeEventListener("popstate", handlePopstate);
      clearFromPayment(); // 페이지 떠날 때 sessionStorage 삭제
    };
  }, []);

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
          action: (
            <Link
              to={`/order/payment/${orderId}`}
              state={{ retry: true }}
              className="text-orange-400 underline"
            >
              Try again
            </Link>
          ),
        };
      case "failed":
        return {
          title: "Payment failed",
          message:
            "We couldn't process your payment. Please try again or use a different method.",
          action: (
            <Link
              to={`/order/payment/${orderId}`}
              state={{ retry: true }}
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

  // status에 따른 객체가 반환됨.
  const { title, message, action } = getContent();

  return (
    <div className="text-center p-20">
      <h1 className="text-2xl font-bold mb-5">{title}</h1>
      <p className="text-xl font-semibold mb-5">{message}</p>
      {action}
    </div>
  );
}
