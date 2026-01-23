import { useContext, useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { PaymentElement } from "@stripe/react-stripe-js/checkout";
import { useStripe, useElements } from "@stripe/react-stripe-js";

import Button from "../../UI/Button";
import CartContext from "../../../contexts/CartContext";
import PaymentService from "../../../services/payment.service";
import AuthContext from "../../../contexts/AuthContext";
import ErrorAlert from "../../user_feedback/ErrorAlert";
import Spinner from "../../user_feedback/Spinner";

// **Stripe Webhook 이벤트(payment_intent.succeeded)**를 연결해서
// 결제 완료 시 백엔드가 자동으로 orders.status = 'paid'로 업데이트

export default function PaymentForm({ orderId }) {
  const { items, totalAmount } = useContext(CartContext);
  const authContext = useContext(AuthContext);
  const navigate = useNavigate();
  const stripe = useStripe();
  const elements = useElements();

  const [isPayProcessing, setIsPayProcessing] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");
  const [inputError, setInputError] = useState(false);
  const [saveCard, setSaveCard] = useState(false);
  const [cardholderName, setCardholderName] = useState("");

  const handlePaymentSubmit = async (e) => {
    e.preventDefault();
    setIsPayProcessing(true);
    setErrorMsg("");

    if (!stripe || !elements) return;

    if (cardholderName.trim() === "") {
      setErrorMsg("Please enter the name on the card.");
      setInputError(true);
      return;
    }

    const paymentService = new PaymentService(
      new AbortController(),
      authContext,
    );

    try {
      // 결제 승인 시도
      const result = await stripe.confirmPayment({
        elements, // <PaymentElement />가 생성한 카드 정보
        confirmParams: {
          payment_method_data: {
            billing_details: {
              name: cardholderName,
            },
          },
          return_url: `${window.location.origin}/order/order-completed`,
        }, // 3D Secure 인증 카드로 결제 후 리디렉팅되는 페이지
        setup_future_usage: saveCard ? "off_session" : undefined,
      });

      if (result.error) {
        console.error(result.error.message);
        const userFriendlyMsg =
          result.error.type === "card_error"
            ? result.error.message
            : "Something went wrong during payment. Please try again.";
        setErrorMsg(userFriendlyMsg);
        setIsPayProcessing(false);
        return;
      }

      const paymentIntent = result.paymentIntent;
      const cardDetails =
        paymentIntent.charges?.data?.[0]?.payment_method_details?.card;

      const payDetails = {
        order_id: orderId,
        stripe_payment_intent_id: paymentIntent.id,
        amount: paymentIntent.amount / 100,
        currency: paymentIntent.currency,
        payment_status: paymentIntent.status,
        payment_method: paymentIntent.payment_method_types[0],
        receipt_url: paymentIntent.charges?.data[0]?.receipt_url || null, // 결제 내역 보기
        card_brand: cardDetails.brand,
        card_last4: cardDetails.last4,
        card_exp_month: cardDetails.exp_month,
        card_exp_year: cardDetails.exp_year,
      };

      if (paymentIntent.status === "succeeded") {
        await paymentService.PayForOrder(payDetails);
        navigate("/order/order-completed"); // 주문 번호 필요하지 않음??
      }
    } catch (err) {
      const returnedErrorMsg = err?.response?.data?.error || err.message;
      console.error("DB save failed:", returnedErrorMsg);
      setErrorMsg(returnedErrorMsg);
    } finally {
      setIsPayProcessing(false);
    }
  };

  const onCancelSubmit = () => {
    navigate("/cart");
  };

  useEffect(() => {
    document.title = "Payment | Foodie";
  }, []);

  if (isPayProcessing) return <Spinner />;

  return (
    <main className="min-h-screen flex justify-center items-start bg-gray-50 py-20 px-4">
      {errorMsg && (
        <div className="mb-4">
          <ErrorAlert
            title="We couldn’t complete your payment."
            message={errorMsg}
          />
        </div>
      )}
      <section className="w-full max-w-lg bg-white shadow-xl rounded-xl p-8">
        <h2 className="text-2xl font-semibold text-gray-800 mb-6 border-b pb-3">
          Payment
        </h2>

        {!stripe || !elements ? (
          <Spinner />
        ) : (
          <form onSubmit={handlePaymentSubmit}>
            <input
              type="text"
              value={cardholderName}
              onChange={(e) => setCardholderName(e.target.value)}
              placeholder="Name on card"
              className={`border rounded-md px-3 py-2 mt-1 w-full outline-none transition
          ${inputError ? "border-red-500 ring-1 ring-red-500" : "border-gray-300 focus:ring-2 focus:ring-blue-400"}
        `}
            />
            {inputError && (
              <p className="text-red-500 text-sm mt-1">{errorMsg}</p>
            )}
            <PaymentElement />

            <label className="flex items-center gap-2 mt-4">
              <input
                type="checkbox"
                checked={saveCard}
                onChange={() => setSaveCard(!saveCard)}
              />
              Save this card for future payments
            </label>

            <div className="flex justify-between items-center mt-8">
              <Button
                type="button"
                textOnly
                propStyle="text-gray-500 hover:text-gray-700"
                onClick={onCancelSubmit}
              >
                Cancel
              </Button>
              <Button
                type="submit"
                className="bg-yellow-400 hover:bg-yellow-500 text-gray-900 font-semibold rounded-md px-5 py-2 transition"
              >
                Place an order
              </Button>
            </div>
          </form>
        )}
      </section>
    </main>
  );
}
