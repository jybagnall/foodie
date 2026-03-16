import { useContext, useState, useEffect, useMemo } from "react";
import { loadStripe } from "@stripe/stripe-js";
import { Elements } from "@stripe/react-stripe-js";
import { useNavigate, useParams } from "react-router-dom";
import CartContext from "../../../contexts/CartContext";
import Spinner from "../../user_feedback/Spinner";
import AuthContext from "../../../contexts/AuthContext";
import PaymentService from "../../../services/payment.service";
import PaymentFormWrapper from "./PaymentFormWrapper";
import ErrorAlert from "../../user_feedback/ErrorAlert";
import { getUserErrorMessage } from "../../../utils/getUserErrorMsg";

// 🤔 컴포넌트의 목적:
// 해당 주문에 대한 Stripe 결제 준비 * 결제 UI의 컨테이너 컴포넌트
// Fallback path의 역할: 3DS 인증 후
const stripePromise = loadStripe(import.meta.env.VITE_STRIPE_PUBLISHABLE_KEY);

export default function OrderPayment() {
  const { orderId } = useParams();
  const [clientSecret, setClientSecret] = useState("");
  const [errorMsg, setErrorMsg] = useState("");
  const { totalAmount } = useContext(CartContext);
  const { accessToken } = useContext(AuthContext);
  const navigate = useNavigate();

  const paymentService = new PaymentService(
    new AbortController(),
    () => accessToken,
  );

  // 해당 결제에 대한 준비, race condition을 막는 장치 넣음.
  // PaymentIntent(금액, 통화, customerId)는 서버에서 고정됨,
  // 즉 결제 주문서
  // clientSecret = 그 주문서를 열 수 있는 1회용 코드
  // ❗렌더링마다 Elements 안의 clientSecret 객체가 새로 만들어짐
  useEffect(() => {
    let isMounted = true;

    const createIntent = async () => {
      if (!orderId) {
        setErrorMsg("Invalid order.");
        return;
      }

      try {
        const { clientSecret } = await paymentService.createPaymentIntent({
          currency: "usd",
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

    createIntent();

    return () => {
      isMounted = false;
    };
  }, [orderId]);

  // 3D Secure 인증 후 URL에 ?redirect_status=succeeded 붙어서 돌아옴
  const redirectStatus = useMemo(() => {
    const params = new URLSearchParams(window.location.search);
    return params.get("redirect_status");
  }, []);

  // Stripe 쪽 인증 + 결제 흐름은 끝났으나 결제 완료 확정은 아님
  // ❗ DB 저장은 Webhook 또는 이전 단계에서 처리됐다고 가정?
  // ❗ 3DS 필요해서 브라우저 리디렉션 발생했을 때 처리법, 잘되는지 체크해볼 것
  useEffect(() => {
    if (redirectStatus === "succeeded") {
      navigate(`/order/order-completed/${orderId}`, { replace: true });
      return;
    }
  }, [redirectStatus, navigate, orderId]);

  // 결제 안정성 보장을 위한 useMemo, 왜?
  // <Elements>는 한 번 초기화되면 options가 바뀌는 걸 절대 허용하지 않는다
  // clientSecret이 진짜로 바뀔 때만 새로운 options 객체를 만들어라
  // clientSecret = 비밀번호, { clientSecret } 객체 = 비밀번호가 적힌 봉투
  const elementsOptions = useMemo(() => ({ clientSecret }), [clientSecret]);

  if (!clientSecret) {
    return <Spinner />;
  }

  if (errorMsg) {
    return (
      <ErrorAlert title="We couldn’t start your payment" message={errorMsg} />
    );
  }

  if (redirectStatus === "failed") {
    return (
      <ErrorAlert
        title="We couldn't complete your payment"
        message="Something went wrong during payment. Please try again."
      />
    );
  }

  return (
    <Elements stripe={stripePromise} options={elementsOptions}>
      <PaymentFormWrapper orderId={orderId} />
    </Elements>
  );
}
