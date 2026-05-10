import { useState, useEffect, useRef, useMemo } from "react";
import { useLocation } from "react-router-dom";
import { ExclamationTriangleIcon } from "@heroicons/react/24/outline";
import { loadStripe } from "@stripe/stripe-js";
import { Elements } from "@stripe/react-stripe-js";
import PaymentService from "../../../services/payment.service";
import { getUserErrorMessage } from "../../../utils/getUserErrorMsg";
import useAccessToken from "../../../hooks/useAccessToken";
import PaymentMethodSelector from "./PaymentMethodSelector";
import Spinner from "../../user_feedback/Spinner";
import EmptyDataState from "../../UI/EmptyDataState";

const stripePromise = loadStripe(import.meta.env.VITE_STRIPE_PUBLISHABLE_KEY);

// 🤔 컴포넌트의 목적:
// 해당 주문에 대한 Stripe 결제 준비 (clientSecret) & 결제 UI의 컨테이너 컴포넌트

export default function StripePaymentSetup({ order, orderId }) {
  const [clientSecret, setClientSecret] = useState("");
  const [errorMsg, setErrorMsg] = useState("");
  const accessToken = useAccessToken();
  const location = useLocation();
  const abortControllerRef = useRef(null);
  const isRetry = location.state?.retry === true;

  useEffect(() => {
    abortControllerRef.current = new AbortController();
    const paymentService = new PaymentService(
      abortControllerRef.current.signal,
      () => accessToken,
    );

    const createIntent = async () => {
      if (clientSecret) return;

      try {
        const { clientSecret: secret } =
          await paymentService.createPaymentIntent({ orderId });
        setClientSecret(secret);
      } catch (err) {
        const message = getUserErrorMessage(err);
        if (message) setErrorMsg(message);
      }
    };

    const findExistingPayment = async () => {
      try {
        const { clientSecret: secret } =
          await paymentService.findPayment(orderId);
        setClientSecret(secret);
      } catch (err) {
        const message = getUserErrorMessage(err);
        if (message) setErrorMsg(message);
      }
    };

    if (isRetry) {
      findExistingPayment();
    } else {
      createIntent();
      // Stripe가 payment_intent.created 이벤트를 Webhook으로 자동 전송함
    }

    return () => {
      abortControllerRef.current.abort();
    };
  }, [orderId, isRetry]);

  const elementsOptions = useMemo(
    () => ({
      clientSecret,
      appearance: {
        theme: "night", // dark 기반 추천
        variables: {
          colorBackground: "#4b5563", // gray-700
          colorText: "#D1D5DB", // gray-300
          colorPrimary: "#babec5", // 버튼/포커스 색도 맞춤
          colorDanger: "#ef4444", // 에러 (Tailwind red-500)
          colorBorder: "#637081", // gray-600 (경계선 자연스럽게)
        },
      },
      paymentMethodOrder: ["card"], // 카드 사용만 허용
    }),
    [clientSecret],
  );

  if (errorMsg) {
    return (
      <EmptyDataState
        icon={ExclamationTriangleIcon}
        title="Something went wrong"
        message="We couldn’t start your payment. Please refresh the page or try again later."
      />
    ); // paymentIntent 생성 실패, 컴포넌트의 종료
  }

  if (!clientSecret) return <Spinner />; // clientSecret 준비 후에만 Elements 렌더

  return (
    <Elements stripe={stripePromise} options={elementsOptions}>
      <PaymentMethodSelector order={order} orderId={orderId} />
    </Elements>
  );
}
