import { useNavigate, useParams, useSearchParams } from "react-router-dom";
import { useContext, useEffect, useRef, useState } from "react";
import { useQueryClient } from "@tanstack/react-query";
import PaymentService from "../../../services/payment.service";
import CartContext from "../../../contexts/CartContext";
import {
  revokePaymentFlowAccess,
  hasPaymentFlowAccess,
} from "../../../storage/paymentStorage";
import useAccessToken from "../../../hooks/useAccessToken";
import { mapPaymentStatusToContent } from "./mapPaymentStatusToContent";
import useUserId from "../../../hooks/useUserId";

// /order/completed/orderId?payment_intent=

export default function OrderConfirmation() {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const [searchParams] = useSearchParams();
  const paymentIntentId = searchParams.get("payment_intent");
  const abortControllerRef = useRef(null);
  const timeoutRef = useRef(null);
  const { orderId } = useParams();
  const userId = useUserId();
  const [status, setStatus] = useState(paymentIntentId ? "loading" : "error");
  const [paymentErr, setPaymentErr] = useState("");
  const accessToken = useAccessToken();
  const { removeOrderedItemsFromCart } = useContext(CartContext);

  useEffect(() => {
    document.title = "Order Confirmation | Foodie";
  }, []);

  // 이 페이지는 결제 직후에만 도착 가능, 그외는 튕겨냄
  useEffect(() => {
    const hasPaymentAccess = hasPaymentFlowAccess();
    if (!hasPaymentAccess) {
      navigate(`/my-account/orders`, { replace: true });
      return;
    } // 다른 곳에서 이 페이지에 재진입 시 유저를 튕겨냄

    revokePaymentFlowAccess(); // ✅ 입장 확인 즉시 sessionStorage 삭제
  }, []);

  useEffect(() => {
    if (!paymentIntentId) {
      return;
    }

    abortControllerRef.current = new AbortController();
    const paymentService = new PaymentService(
      abortControllerRef.current.signal,
      () => accessToken,
    );

    const verifyStatus = async (retryCount = 0) => {
      try {
        const { paymentIntentStatus, lastPaymentError } =
          await paymentService.verifyPayment(paymentIntentId, orderId);

        setStatus(paymentIntentStatus);

        if (lastPaymentError) {
          setPaymentErr(lastPaymentError);
        }

        if (paymentIntentStatus === "succeeded") {
          removeOrderedItemsFromCart();
          queryClient.invalidateQueries({ queryKey: ["savedCards", userId] });
          queryClient.invalidateQueries({ queryKey: ["orders", userId] });
        }

        if (paymentIntentStatus === "processing" && retryCount < 5) {
          timeoutRef.current = setTimeout(
            () => verifyStatus(retryCount + 1),
            2000,
          );
        } else if (paymentIntentStatus === "processing") {
          setStatus("processing_timeout"); // 결제 상태가 계속 진행 중이면
        }
      } catch (err) {
        const status = err.response?.status;

        if (status === 400) {
          setStatus("invalid_payment");
          return;
        }

        if (status >= 500) {
          setStatus("server_error");
          return;
        }

        setStatus("error");
      }
    };

    verifyStatus();

    return () => {
      abortControllerRef.current?.abort();
      clearTimeout(timeoutRef.current);
    };
  }, [
    paymentIntentId,
    removeOrderedItemsFromCart,
    queryClient,
    userId,
    orderId,
  ]);

  // status에 따른 객체가 반환됨.
  const { title, message, action } = mapPaymentStatusToContent(
    status,
    paymentErr,
    orderId,
  );

  return (
    <div className="text-center p-20">
      <h1 className="text-2xl font-bold mb-5 text-blue-400">{title}</h1>
      <p className="text-xl font-semibold mb-5 text-gray-300">{message}</p>
      {action}
    </div>
  );
}
