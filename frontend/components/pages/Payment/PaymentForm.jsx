import { useContext, useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useCheckout, PaymentElement } from "@stripe/react-stripe-js/checkout";
import Button from "../../UI/Button";
import CartContext from "../../../contexts/CartContext";
import PaymentService from "../../../services/payment.service";
import AuthContext from "../../../contexts/AuthContext";
import ErrorAlert from "../../user_feedback/ErrorAlert";
import Spinner from "../../user_feedback/Spinner";

export default function PaymentForm({ orderId }) {
  const { items, totalAmount } = useContext(CartContext);
  const authContext = useContext(AuthContext);
  const navigate = useNavigate();
  const checkoutState = useCheckout();

  const [isPayProcessing, setIsPayProcessing] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");

  const handlePaymentSubmit = async (e) => {
    e.preventDefault();

    // 사용자의 결제 세션(PaymentIntent)을 추적, 관리
    const { checkout } = checkoutState;

    const result = await checkout.confirm({
      elements, // Stripe (<PaymentElement />)가 생성한 *카드 입력 필드 등의 내부 보안 객체
      confirmParams: {
        return_url: `${window.location.origin}/my-account/order-completed`,
      },
    }); // 결제 승인 시도

    if (result.type === "error") {
      setErrorMsg(result.error.message);
    } else {
      navigate("/my-account/order-completed");
    } // 🤔🤔🤔또 리디렉팅을 하는 로직이 있음

    const paymentService = new PaymentService(
      new AbortController(),
      authContext,
    );

    try {
      setIsPayProcessing(true);
      await paymentService.PayForOrder(orderId);
    } catch (err) {
      const returnedErrorMsg = err?.response?.data?.error || err.message;
      setErrorMsg(returnedErrorMsg);
    } finally {
      setIsPayProcessing(false);
    }
  };

  const onCancelSubmit = () => {
    navigate("/");
  };

  useEffect(() => {
    document.title = "Payment | Foodie";
  }, []);

  if (checkoutState.type === "loading" || isPayProcessing) {
    return <Spinner />;
  } else if (checkoutState.type === "error") {
    setErrorMsg(checkoutState.error.message);
  }

  return (
    <main className="min-h-screen flex justify-center items-start bg-gray-50 py-20 px-4">
      {errorMsg && (
        <div className="mb-4">
          <ErrorAlert title="There was a problem" message={errorMsg} />
        </div>
      )}
      <section className="w-full max-w-lg bg-white shadow-xl rounded-xl p-8">
        <h2 className="text-2xl font-semibold text-gray-800 mb-6 border-b pb-3">
          Payment
        </h2>

        <form onSubmit={handlePaymentSubmit}>
          <PaymentElement />

          <div className="flex justify-between items-center mt-8">
            <Button
              type="button"
              textOnly
              propStyle="text-gray-500 hover:text-gray-700"
              onClick={onCancelSubmit}
            >
              Cancel
            </Button>
            <Button className="bg-yellow-400 hover:bg-yellow-500 text-gray-900 font-semibold rounded-md px-5 py-2 transition">
              Place an order
            </Button>
          </div>
        </form>
      </section>
    </main>
  );
}
