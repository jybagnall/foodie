import { useState, useEffect, useMemo, useRef } from "react";
import { loadStripe } from "@stripe/stripe-js";
import { Elements } from "@stripe/react-stripe-js";
import { useLocation, useNavigate, useParams } from "react-router-dom";
import Spinner from "../../user_feedback/Spinner";
import PaymentService from "../../../services/payment.service";
import PaymentFormWrapper from "./PaymentFormWrapper";
import ErrorAlert from "../../user_feedback/ErrorAlert";
import { getUserErrorMessage } from "../../../utils/getUserErrorMsg";
import useAccessToken from "../../../hooks/useAccessToken";

// 🤔 컴포넌트의 목적:
// 해당 주문에 대한 Stripe 결제 준비 * 결제 UI의 컨테이너 컴포넌트
// Fallback path의 역할: 3DS 인증 후
const stripePromise = loadStripe(import.meta.env.VITE_STRIPE_PUBLISHABLE_KEY);

export default function OrderPayment() {
  const { orderId } = useParams();
  const [clientSecret, setClientSecret] = useState("");
  const [errorMsg, setErrorMsg] = useState("");
  const accessToken = useAccessToken();
  const navigate = useNavigate();
  const location = useLocation();
  const abortControllerRef = useRef(null);
  const isRetry = location.state?.retry === true;

  useEffect(() => {
    document.title = "Payment | Foodie";
  }, []);

  // 해당 결제에 대한 준비
  // clientSecret = 그 주문서를 열 수 있는 1회용 코드
  useEffect(() => {
    abortControllerRef.current?.abort();
    abortControllerRef.current = new AbortController();
    const paymentService = new PaymentService(
      abortControllerRef.current.signal,
      () => accessToken,
    );

    const createIntent = async () => {
      try {
        const { clientSecret } = await paymentService.createPaymentIntent({
          orderId,
        });
        setClientSecret(clientSecret);
      } catch (err) {
        const message = getUserErrorMessage(err);
        if (message) setErrorMsg(message);
      }
    };

    const findExistingPayment = async () => {
      try {
        const { clientSecret } = await paymentService.findPayment(orderId);
        setClientSecret(clientSecret);
      } catch (err) {
        const message = getUserErrorMessage(err);
        setErrorMsg(message);
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

  // 3D Secure 인증 후 URL에 ?redirect_status=succeeded 혹은 failed가 붙어서 돌아옴,
  // redirectStatus === "failed" (결제 실패) clientSecret을 새로 만들 필요 없음.

  const redirectStatus = useMemo(() => {
    const params = new URLSearchParams(window.location.search);
    return params.get("redirect_status");
  }, []);

  // 결제 안정성 보장을 위한 useMemo, 왜?
  // <Elements>는 한 번 초기화되면 options가 바뀌는 걸 절대 허용하지 않는다
  // clientSecret이 진짜로 바뀔 때만 새로운 options 객체를 만들어라
  // clientSecret = 비밀번호, { clientSecret } 객체 = 비밀번호가 적힌 봉투
  const elementsOptions = useMemo(
    () => ({
      clientSecret,
      appearance: {
        theme: "night", // dark 기반 추천
        variables: {
          colorBackground: "#4c586b", // gray-700
          colorText: "#D1D5DB", // gray-300
          colorPrimary: "#D1D5DB", // 버튼/포커스 색도 맞춤
          colorDanger: "#ef4444", // 에러 (Tailwind red-500)
          colorBorder: "#637081", // gray-600 (경계선 자연스럽게)
        },
      },
    }),
    [clientSecret],
  );

  useEffect(() => {
    if (redirectStatus === "succeeded" || redirectStatus === "failed") {
      navigate(`/order/completed/${orderId}`, {
        replace: true,
        state: { status: redirectStatus },
      });
    }
  }, [redirectStatus, orderId, navigate]);

  if (errorMsg) {
    return (
      <ErrorAlert title="We couldn’t start your payment" message={errorMsg} />
    ); // paymentIntent 생성 실패, 컴포넌트의 종료
  }

  if (!clientSecret) {
    return <Spinner />;
  }

  return (
    <Elements stripe={stripePromise} options={elementsOptions}>
      <PaymentFormWrapper orderId={orderId} />
    </Elements>
  );
}
