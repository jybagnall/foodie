import { useElements, useStripe } from "@stripe/react-stripe-js";
import PaymentForm from "./PaymentForm";
import Spinner from "../../user_feedback/Spinner";

export default function PaymentFormWrapper({ orderId }) {
  const stripe = useStripe();
  const elements = useElements();

  if (!stripe || !elements) {
    return <Spinner />;
  }

  return <PaymentForm orderId={orderId} stripe={stripe} elements={elements} />;
}

// ❗컴포넌트 존재의 이유:
// 1. Stripe hook은 오직 한 곳에서만 호출
// 2. stripe / elements 준비 여부를 완전히 격리
// 3. PaymentForm을 순수 컴포넌트로 유지
