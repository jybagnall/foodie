import { useContext, useState, useEffect, useMemo } from "react";
import { loadStripe } from "@stripe/stripe-js";
import { Elements } from "@stripe/react-stripe-js";
import { useParams } from "react-router-dom";
import CartContext from "../../../contexts/CartContext";
import Spinner from "../../user_feedback/Spinner";
import AuthContext from "../../../contexts/AuthContext";
import PaymentService from "../../../services/payment.service";
import PaymentFormWrapper from "./PaymentFormWrapper";

const stripePromise = loadStripe(import.meta.env.VITE_STRIPE_PUBLISHABLE_KEY);

export default function OrderPayment() {
  const { orderId } = useParams();
  const [clientSecret, setClientSecret] = useState("");
  const { totalAmount } = useContext(CartContext);
  const { accessToken } = useContext(AuthContext);

  const paymentService = new PaymentService(
    new AbortController(),
    () => accessToken,
  );

  // 해당 결제에 대한 준비를 해둠
  useEffect(() => {
    const createIntent = async () => {
      const { clientSecret } = await paymentService.createPaymentIntent({
        amount: totalAmount * 100, // 결제 금액 (단위는 '센트'라서 *100)
        currency: "usd",
        orderId,
      });

      setClientSecret(clientSecret);
    };

    createIntent();
  }, [totalAmount, orderId]); // orderId 추가🤔🤔

  const elementsOptions = useMemo(() => ({ clientSecret }), [clientSecret]);

  if (!clientSecret) {
    return <Spinner />;
  }

  return (
    <Elements stripe={stripePromise} options={elementsOptions}>
      <PaymentFormWrapper orderId={orderId} />
    </Elements>
  );
}
