import { useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import { PaymentElement } from "@stripe/react-stripe-js";
import Button from "../../UI/Button";
import ErrorAlert from "../../user_feedback/ErrorAlert";
import { grantPaymentFlowAccess } from "../../../storage/paymentStorage";
import { getUserErrorMessage } from "../../../utils/getUserErrorMsg";
import PaymentService from "../../../services/payment.service";
import useAccessToken from "../../../hooks/useAccessToken";
import SaveCardPreferences from "./SaveCardPreferences";
import { confirmStripePayment } from "../../../utils/stripeHelpers";

// **Stripe Webhook 이벤트(payment_intent.succeeded)**를 연결해서
// 결제 완료 시 백엔드가 자동으로 orders.status = 'paid'로 업데이트

export default function PaymentForm({ orderId, stripe, elements }) {
  const navigate = useNavigate();
  const [saveCard, setSaveCard] = useState(false);
  const [setAsDefault, setSetAsDefault] = useState(false);
  const [isPayProcessing, setIsPayProcessing] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");
  const abortControllerRef = useRef(null);
  const accessToken = useAccessToken();

  useEffect(() => {
    return () => abortControllerRef.current?.abort();
  }, []);

  // Stripe는 에러를 throw하지 않고, return 값의 error로 줌.
  const handlePaymentSubmit = async (e) => {
    e.preventDefault();
    if (isPayProcessing) return; // 중복 요청의 차단

    abortControllerRef.current = new AbortController();

    const paymentService = new PaymentService(
      abortControllerRef.current.signal,
      () => accessToken,
    );

    setIsPayProcessing(true);
    setErrorMsg("");

    try {
      await paymentService.updatePaymentIntent(orderId, saveCard, setAsDefault);
      const result = await confirmStripePayment({ stripe, elements, orderId });
      if (result.status !== "success") {
        setErrorMsg(result.message);
        return; // 이동 안함
      }

      const paymentIntentId = result?.paymentIntent?.id; // 결제 아이디

      if (!paymentIntentId) {
        setErrorMsg("Please try again shortly.");
        return;
      }

      grantPaymentFlowAccess();
      window.location.replace(
        `/order/completed/${orderId}?payment_intent=${paymentIntentId}`,
      );
    } catch (err) {
      const message = getUserErrorMessage(err);
      if (message) setErrorMsg(message);
    } finally {
      setIsPayProcessing(false);
    }
  };

  const onCancelSubmit = () => {
    navigate("/cart");
  };

  // ❌오류가 뜬 이유: Stripe Elements가 결제 중 DOM에서 제거됨.
  // if (isPayProcessing) return <Spinner />;

  return (
    <main className="min-h-screen flex justify-center items-start py-20 px-4">
      <section className="w-full max-w-lg bg-gray-700 shadow-xl rounded-xl p-8">
        {errorMsg && (
          <div className="mb-4">
            <ErrorAlert
              title="We couldn’t complete your payment."
              message={errorMsg}
            />
          </div>
        )}
        <h2 className="text-2xl font-semibold text-gray-200 mb-6 border-b border-gray-300 pb-3">
          Payment
        </h2>

        <form onSubmit={handlePaymentSubmit}>
          <PaymentElement
            options={{
              wallets: { link: "never" },
            }}
          />

          <SaveCardPreferences
            saveCard={saveCard}
            setSaveCard={setSaveCard}
            setAsDefault={setAsDefault}
            setSetAsDefault={setSetAsDefault}
          />

          <div className="flex justify-between items-center mt-8">
            <Button
              type="button"
              textOnly
              className="text-gray-300 hover:text-gray-400"
              onClick={onCancelSubmit}
            >
              Cancel
            </Button>
            <Button
              type="submit"
              disabled={isPayProcessing}
              className="bg-yellow-400 hover:bg-yellow-500 text-gray-900 font-semibold rounded-md px-5 py-2 transition"
            >
              Place an order
            </Button>
          </div>
        </form>
      </section>
    </main>
  );
}
