import { Elements } from "@stripe/react-stripe-js";
import { Outlet, useParams } from "react-router-dom";
import { loadStripe } from "@stripe/stripe-js";

import PaymentForm from "./PaymentForm";

const stripePromise = loadStripe(import.meta.env.VITE_STRIPE_PUBLISHABLE_KEY);

export default function StripeWrapper() {
  const { orderId } = useParams();

  return (
    <Elements stripe={stripePromise}>
      <PaymentForm orderId={orderId} />
    </Elements>
  );
}
