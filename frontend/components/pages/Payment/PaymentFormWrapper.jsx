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
