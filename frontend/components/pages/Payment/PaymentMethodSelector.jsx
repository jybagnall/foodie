import { useEffect, useRef, useState } from "react";
import { useStripe } from "@stripe/react-stripe-js";
import useSavedCards from "../../../hooks/useSavedCards";
import Button from "../../UI/Button";
import ErrorAlert from "../../user_feedback/ErrorAlert";
import SavedCard from "./SavedCard";
import PaymentFormWrapper from "./PaymentFormWrapper";
import Spinner from "../../user_feedback/Spinner";
import useAccessToken from "../../../hooks/useAccessToken";
import SpinnerMini from "../../user_feedback/SpinnerMini";
import { getUserErrorMessage } from "../../../utils/getUserErrorMsg";
import PaymentService from "../../../services/payment.service";
import DeliverySummary from "../../OrderUI/DeliverySummary";
import OrderSummary from "../../OrderUI/OrderSummary";
import { grantPaymentFlowAccess } from "../../../storage/paymentStorage";

export default function PaymentMethodSelector({ order, orderId }) {
  const [useNewCard, setUseNewCard] = useState(false);
  const [selectedCardId, setSelectedCardId] = useState(null);
  const [errorMsg, setErrorMsg] = useState("");
  const [isPayProcessing, setIsPayProcessing] = useState(false);
  const accessToken = useAccessToken();
  const { savedCards, isFetching, isFetchingError } = useSavedCards();
  const stripe = useStripe();
  const abortControllerRef = useRef(null);

  // 카드 없으면 자동으로 새 카드 모드
  useEffect(() => {
    if (isFetching) return; // ❗이 로직의 부재가 에러의 원인

    if (savedCards.length === 0 || isFetchingError) {
      setUseNewCard(true);
    }
  }, [isFetching]);

  useEffect(() => {
    return () => abortControllerRef.current?.abort();
  }, []);

  const placeOrderWithSavedCard = async () => {
    if (isPayProcessing) return;

    abortControllerRef.current = new AbortController();
    const paymentService = new PaymentService(
      abortControllerRef.current.signal,
      () => accessToken,
    );

    setIsPayProcessing(true);
    setErrorMsg("");

    try {
      let { paymentIntent, requiresAction, clientSecret } =
        await paymentService.chargeSavedCard(orderId, selectedCardId);

      if (requiresAction) {
        const { error, paymentIntent: updatedIntent } =
          await stripe.handleNextAction({
            clientSecret,
          });

        if (error) {
          setErrorMsg(error.message);
          return;
        }

        // redirect 발생 시 코드 진행 안 됨.
        // 유저가 OrderPaymentPage 로 리디렉팅 됨
        if (!updatedIntent) {
          return;
        }

        paymentIntent = updatedIntent;
      }

      if (!paymentIntent?.id) {
        setErrorMsg(
          "An unexpected error occurred. Please try again or contact support.",
        );
        return;
      }

      grantPaymentFlowAccess();
      window.location.replace(
        `/order/completed/${orderId}?payment_intent=${paymentIntent.id}`,
      );
    } catch (err) {
      console.error(err);
      const message = getUserErrorMessage(err);
      if (message) {
        setErrorMsg(message);
      }
    } finally {
      setIsPayProcessing(false);
    }
  };

  if (isFetching) return <Spinner />;

  if (useNewCard) {
    return <PaymentFormWrapper orderId={orderId} />;
  }

  return (
    <main className="container mx-auto px-4 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-5xl">
        {errorMsg && (
          <div className="mb-4">
            <ErrorAlert title="There was a problem" message={errorMsg} />
          </div>
        )}
        <div className="w-full rounded-lg border-2 border-yellow-600 p-6 text-left mt-5">
          <h2
            className={`text-2xl font-semibold text-gray-200 mb-6 pb-3 border-b`}
          >
            Payment method
          </h2>

          <div className="mt-6 grid grid-cols-1 md:grid-cols-3 gap-6">
            {/* LEFT SIDE */}
            <div className="md:col-span-2 space-y-6">
              <DeliverySummary order={order} />

              <div className="border rounded-lg p-5 border-gray-200">
                <div className="flex flex-col gap-5">
                  {savedCards.map((card) => (
                    <SavedCard
                      key={card.id}
                      card={card}
                      selectedCardId={selectedCardId}
                      setSelectedCardId={setSelectedCardId}
                    />
                  ))}
                  <Button
                    onClick={() => setUseNewCard(true)}
                    className="text-yellow-300 hover:text-yellow-400 bg-gray-500"
                  >
                    Add a credit / debit card
                  </Button>
                </div>
              </div>
            </div>

            <div className="md:col-span-1 space-y-6">
              <OrderSummary order={order} />
              {selectedCardId && (
                <Button
                  onClick={placeOrderWithSavedCard}
                  disabled={isPayProcessing}
                  className="w-full text-yellow-300 hover:text-yellow-400 bg-gray-500 mt-1"
                >
                  {isPayProcessing ? <SpinnerMini /> : "Place an order"}
                </Button>
              )}
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}
