import { useState, useEffect, useRef } from "react";
import { loadStripe } from "@stripe/stripe-js";
import {
  useLocation,
  useNavigate,
  useParams,
  useSearchParams,
} from "react-router-dom";
import PaymentService from "../../../services/payment.service";
import ErrorAlert from "../../user_feedback/ErrorAlert";
import { getUserErrorMessage } from "../../../utils/getUserErrorMsg";
import useAccessToken from "../../../hooks/useAccessToken";
import PaymentMethodSelector from "./PaymentMethodSelector";

// 🤔 컴포넌트의 목적:
// 해당 주문에 대한 Stripe 결제 준비 * 결제 UI의 컨테이너 컴포넌트
// Fallback path의 역할: 3DS 인증 후

export default function OrderPayment() {
  const { orderId } = useParams();
  const [clientSecret, setClientSecret] = useState("");
  const [useNewCard, setUseNewCard] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");
  const accessToken = useAccessToken();
  const navigate = useNavigate();
  const location = useLocation();
  const [searchParams] = useSearchParams();
  const abortControllerRef = useRef(null);

  const isRetry = location.state?.retry === true;
  const redirectStatus = searchParams.get("redirect_status");
  const redirectPaymentIntentId = searchParams.get("payment_intent");

  useEffect(() => {
    document.title = "Payment | Foodie";
  }, []);

  useEffect(() => {
    abortControllerRef.current?.abort();
    abortControllerRef.current = new AbortController();
    const paymentService = new PaymentService(
      abortControllerRef.current.signal,
      () => accessToken,
    );

    const createIntent = async () => {
      if (clientSecret) return;
      try {
        const { clientSecret: newClientSecret } =
          await paymentService.createPaymentIntent({
            orderId,
          });
        setClientSecret(newClientSecret);
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
  useEffect(() => {
    if (redirectStatus === "succeeded" || redirectStatus === "failed") {
      navigate(
        `/order/completed/${orderId}?payment_intent=${redirectPaymentIntentId}`,
        {
          replace: true,
          state: { status: redirectStatus },
        },
      );
    }
  }, [redirectStatus, redirectPaymentIntentId, orderId, navigate]);

  if (errorMsg) {
    return (
      <ErrorAlert title="We couldn’t start your payment" message={errorMsg} />
    ); // paymentIntent 생성 실패, 컴포넌트의 종료
  }

  return (
    <PaymentMethodSelector
      orderId={orderId}
      useNewCard={useNewCard}
      setUseNewCard={setUseNewCard}
      clientSecret={clientSecret}
    />
  );
}
