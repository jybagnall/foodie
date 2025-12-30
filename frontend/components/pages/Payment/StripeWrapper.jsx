import { Elements } from "@stripe/react-stripe-js";
import { loadStripe } from "@stripe/stripe-js";
import PaymentForm from "./PaymentForm";
import { useParams } from "react-router-dom";

const stripePromise = loadStripe(import.meta.env.VITE_STRIPE_PUBLISHABLE_KEY);

export default function StripeWrapper() {
  const { orderId } = useParams();

  return (
    <div>
      <Elements stripe={stripePromise}>
        <PaymentForm orderId={orderId} />
      </Elements>
    </div>
  );
}
