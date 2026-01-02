import { Elements } from "@stripe/react-stripe-js";
import { loadStripe } from "@stripe/stripe-js";
import PaymentForm from "./PaymentForm";
import { useParams } from "react-router-dom";
import Spinner from "../../user_feedback/Spinner";

const stripePromise = loadStripe(import.meta.env.VITE_STRIPE_PUBLISHABLE_KEY);

export default function StripeWrapper() {
  const { orderId } = useParams();

  if (!stripePromise) return <Spinner />;

  return (
    <Elements stripe={stripePromise}>
      <PaymentForm orderId={orderId} />
    </Elements>
  );
}
