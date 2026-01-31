import { useContext, useState, useEffect } from "react";
import { loadStripe } from "@stripe/stripe-js";
import { Elements } from "@stripe/react-stripe-js";
import { useParams } from "react-router-dom";
import CartContext from "../../../contexts/CartContext";
import PaymentForm from "./PaymentForm";
import Spinner from "../../user_feedback/Spinner";
import AuthContext from "../../../contexts/AuthContext";
import PaymentService from "../../../services/payment.service";

const stripePromise = loadStripe(import.meta.env.VITE_STRIPE_PUBLISHABLE_KEY);

export default function OrderPayment() {
  const { orderId } = useParams();
  const [clientSecret, setClientSecret] = useState("");
  const { totalAmount } = useContext(CartContext);
  const authContext = useContext(AuthContext);

  const paymentService = new PaymentService(new AbortController(), authContext);

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
  }, [totalAmount]);

  return (
    <>
      {!clientSecret ? (
        <Spinner />
      ) : (
        <Elements stripe={stripePromise} options={{ clientSecret }}>
          <PaymentForm orderId={orderId} />
        </Elements>
      )}
    </>
  );
}

// await stripe.paymentIntents.update(paymentIntent.id, {
//   setup_future_usage: "off_session",
// });

//  const paymentIntent = await stripe.paymentIntents.create({
//     amount,
//     currency,
//     customer: user.stripe_customer_id, // 서버에서 보유
//     automatic_payment_methods: { enabled: true },
//     setup_future_usage: saveCard ? "off_session" : undefined, // 카드 저장 여부 반영
//     metadata: {
//       orderId,          // 주문 추적용
//       userId: user.id,  // 내부 추적용 (안전)
//     },
//   });
