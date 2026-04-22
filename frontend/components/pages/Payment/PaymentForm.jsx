import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { PaymentElement } from "@stripe/react-stripe-js";
import Button from "../../UI/Button";
import Checkbox from "../../UI/Checkbox";
import ErrorAlert from "../../user_feedback/ErrorAlert";
import { markAsFromPayment } from "../../../storage/paymentStorage";

// **Stripe Webhook 이벤트(payment_intent.succeeded)**를 연결해서
// 결제 완료 시 백엔드가 자동으로 orders.status = 'paid'로 업데이트

export default function PaymentForm({ orderId, stripe, elements }) {
  const navigate = useNavigate();
  const [isPayProcessing, setIsPayProcessing] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");

  // 결제 트리거 함수.
  // paymentIntent: 결제 상태 (성공 여부, 금액 등)
  const confirmStripePayment = async () => {
    const { error, paymentIntent } = await stripe.confirmPayment({
      elements,
      confirmParams: {
        return_url: `${window.location.origin}/order/payment/${orderId}`,
      }, // 3D Secure (은행 인증 페이지) 완료 후 리디렉팅되는 페이지
      redirect: "if_required",
    });

    // 카드 번호 혹은 CVC 오류 (결제 시도조차 안 됨)
    if (error?.type === "validation_error") {
      setErrorMsg(error.message);
      return { status: "validation_error" };
    }

    return { paymentIntent };
  };

  // Stripe는 에러를 throw하지 않고, return 값의 error로 줌.
  const handlePaymentSubmit = async ({ saveCard }) => {
    if (isPayProcessing) return; // 중복 요청의 차단
    setIsPayProcessing(true);
    setErrorMsg("");

    try {
      const result = await confirmStripePayment();

      if (result?.status === "validation_error") return; // 이동 안함

      markAsFromPayment();
      navigate(
        `/order/completed/${orderId}?payment_intent=${result.paymentIntent.id}`,
        {
          replace: true, // 뒤로가기에 이 페이지 삭제
          state: { from: "payment" }, // 리디렉팅 시 상태도 몰래 보냄
        },
      ); // 결제의 흐름이 끝났다는 의미의 이동 (3DS 없음)
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
          <PaymentElement />

          <div className="mt-4">
            {/* <Checkbox
              id="saveCard"
              label="Save this card for future payments"
              register={register("saveCard")}
            /> */}
          </div>
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
