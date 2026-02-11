import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { PaymentElement } from "@stripe/react-stripe-js";

import Button from "../../UI/Button";
import ErrorAlert from "../../user_feedback/ErrorAlert";
import Spinner from "../../user_feedback/Spinner";

// **Stripe Webhook 이벤트(payment_intent.succeeded)**를 연결해서
// 결제 완료 시 백엔드가 자동으로 orders.status = 'paid'로 업데이트

// 🤔결제 실패/재시도 로직
// 🤔새로고침/뒤로가기 대응
// 🤔중복 결제 방지
// 🤔Save this card for future payments
// (linkOrderPaymentMethod, upsertPaymentMethod)

export default function PaymentForm({ orderId, stripe, elements }) {
  const navigate = useNavigate();

  const [isPayProcessing, setIsPayProcessing] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");
  const [saveCard, setSaveCard] = useState(false);

  const confirmStripePayment = async () => {
    const { error, paymentIntent } = await stripe.confirmPayment({
      elements,
      confirmParams: {
        return_url: `${window.location.origin}/order/pay-order/${orderId}`,
      }, // 3D Secure (은행 인증 페이지) 완료 후 리디렉팅되는 페이지
      redirect: "if_required",
    });

    if (error) {
      handlePaymentError(error);
      return { status: "error" };
    }

    return { status: paymentIntent?.status, paymentIntent };
  }; // 🤔paymentIntent가 더 이상 쓰이지 않음

  // 오류의 종류: 카드 번호 오류, 카드 한도 초과, CVC 오류, 3DS 인증 실패 처리
  // Webhook 아직 안 옴, DB 저장 없음
  const handlePaymentError = (err) => {
    if (!err) return;
    if (err.type === "card_error" || err.type === "validation_error") {
      setErrorMsg(err.message);
      return;
    }
    if (
      err.type === "api_error" ||
      err.type === "api_connection_error" ||
      err.type === "rate_limit_error" ||
      err.code === "ECONNREFUSED" ||
      err.code === "ENETUNREACH" ||
      err.code === "ETIMEDOUT" ||
      err.message?.includes("NetworkError")
    ) {
      setErrorMsg(
        "We're having trouble connecting to the payment service. Please try again in a few moments.",
      );
      return;
    }
    setErrorMsg("Something went wrong during payment. Please try again.");
  };

  // Stripe는 에러를 throw하지 않고, return 값의 error로 줌.
  const handlePaymentSubmit = async (e) => {
    e.preventDefault();

    if (isPayProcessing) return; // 중복 요청의 차단 ??
    setIsPayProcessing(true);
    setErrorMsg("");

    const result = await confirmStripePayment();

    // 결제의 흐름이 끝났다는 의미의 이동 (3DS 없음)
    if (result?.status === "succeeded") {
      navigate(`/order/order-completed/${orderId}`, { replace: true });
      return;
    }

    if (result?.status === "error") {
      setIsPayProcessing(false);
    }
  };

  const onCancelSubmit = () => {
    navigate("/cart");
  };

  useEffect(() => {
    document.title = "Payment | Foodie";
  }, []);

  // ❌오류가 뜬 이유
  // if (isPayProcessing) return <Spinner />;

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

        <form onSubmit={handlePaymentSubmit}>
          <PaymentElement />

          {/* <label className="flex items-center gap-2 mt-4">
            <input
              type="checkbox"
              checked={saveCard}
              onChange={() => setSaveCard(!saveCard)}
            />
            Save this card for future payments
          </label> */}

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
