import { useState, useEffect, useMemo } from "react";
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
  const isRetry = location.state?.retry === true;

  // 해당 결제에 대한 준비, race condition을 막는 장치 넣음.
  // PaymentIntent(금액, 통화, customerId)는 서버에서 고정됨,
  // 즉 결제 주문서
  // clientSecret = 그 주문서를 열 수 있는 1회용 코드
  // ❗렌더링마다 Elements 안의 clientSecret 객체가 새로 만들어짐
  useEffect(() => {
    const abortController = new AbortController();
    const paymentService = new PaymentService(
      abortController.signal,
      () => accessToken,
    );

    let isMounted = true;

    const createIntent = async () => {
      try {
        const { clientSecret } = await paymentService.createPaymentIntent({
          orderId,
        });

        if (isMounted) {
          setClientSecret(clientSecret);
        }
      } catch (err) {
        const message = getUserErrorMessage(err);
        if (isMounted && message) setErrorMsg(message);
      }
    };

    const findExistingPayment = async () => {
      try {
        const { clientSecret } = await paymentService.findPayment(orderId);
        if (isMounted) setClientSecret(clientSecret);
      } catch (err) {
        const message = getUserErrorMessage(err);
        if (isMounted) setErrorMsg(message);
      }
    };

    if (isRetry) {
      findExistingPayment();
    } else {
      createIntent();
      // Stripe가 payment_intent.created 이벤트를 Webhook으로 자동 전송함
    }

    return () => {
      abortController.abort();
      isMounted = false;
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
  const elementsOptions = useMemo(() => ({ clientSecret }), [clientSecret]);

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

  if (!orderId) {
    return (
      <ErrorAlert
        title="We couldn't start your payment"
        message="Invalid order."
      />
    );
  }

  return (
    <Elements stripe={stripePromise} options={elementsOptions}>
      <PaymentFormWrapper orderId={orderId} />
    </Elements>
  );
}
