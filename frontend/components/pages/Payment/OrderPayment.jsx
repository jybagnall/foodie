import { useContext, useState, useEffect, useMemo } from "react";
import { loadStripe } from "@stripe/stripe-js";
import { Elements } from "@stripe/react-stripe-js";
import { useNavigate, useParams } from "react-router-dom";
import CartContext from "../../../contexts/CartContext";
import Spinner from "../../user_feedback/Spinner";
import PageError from "../../user_feedback/PageError";
import AuthContext from "../../../contexts/AuthContext";
import PaymentService from "../../../services/payment.service";
import PaymentFormWrapper from "./PaymentFormWrapper";
import ErrorAlert from "../../user_feedback/ErrorAlert";

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

  // 해당 결제에 대한 준비
  // PaymentIntent(금액, 통화, customerId)는 서버에서 고정됨. 결제주문서
  // clientSecret = 그 주문서를 열 수 있는 1회용 코드
  // ❗렌더링마다 Elements 안의 clientSecret 객체가 새로 만들어짐
  useEffect(() => {
    const createIntent = async () => {
      try {
        const { clientSecret } = await paymentService.createPaymentIntent({
          amount: totalAmount * 100, // 결제 금액 (단위는 '센트'라서 *100)
          currency: "usd",
          orderId,
        });

        setClientSecret(clientSecret);
      } catch (err) {
        console.error(err);
        setErrorMsg(err);
      }
    };

    createIntent();
  }, [totalAmount, orderId]);

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const redirectStatus = params.get("redirect_status");

    if (redirectStatus === "succeeded") {
      // ❗ 인증 + 결제가 이미 Stripe 쪽에서 끝난 상태
      // ❗ DB 저장은 Webhook 또는 이전 단계에서 처리됐다고 가정?
      navigate("/order/order-completed", { replace: true });
      return;
    }

    if (redirectStatus === "failed") {
      setErrorMsg("Something went wrong during payment. Please try again.");
      return;
    }
  }, [orderId]);

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

  return (
    <Elements stripe={stripePromise} options={elementsOptions}>
      <PaymentFormWrapper orderId={orderId} />
    </Elements>
  );
}
