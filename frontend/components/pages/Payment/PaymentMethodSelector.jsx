import { useCallback, useEffect, useRef, useState } from "react";
import { loadStripe } from "@stripe/stripe-js";
import { Elements } from "@stripe/react-stripe-js";
import { useQueryClient } from "@tanstack/react-query";
import { useNavigate } from "react-router-dom";
import useSavedCards from "../../../hooks/useSavedCards";
import Button from "../../UI/Button";
import ErrorAlert from "../../user_feedback/ErrorAlert";
import SpinnerMini from "../../user_feedback/SpinnerMini";
import SavedCard from "./SavedCard";
import PaymentService from "../../../services/payment.service";
import { getUserErrorMessage } from "../../../utils/getUserErrorMsg";
import useAccessToken from "../../../hooks/useAccessToken";
import PaymentFormWrapper from "./PaymentFormWrapper";
import Spinner from "../../user_feedback/Spinner";
import useUserId from "../../../hooks/useUserId";

const stripePromise = loadStripe(import.meta.env.VITE_STRIPE_PUBLISHABLE_KEY);
// isFetchingError 가 있어도 새 카드 입력창만 나오면 됨
export default function PaymentMethodSelector({
  orderId,
  useNewCard,
  setUseNewCard,
  clientSecret,
  elementsOptions,
}) {
  const { savedCards, isFetching, isFetchingError } = useSavedCards();
  const [selectedCardId, setSelectedCardId] = useState(null);
  const [isPayProcessing, setIsPayProcessing] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");
  const accessToken = useAccessToken();
  const userId = useUserId();
  const queryClient = useQueryClient();
  const abortControllerRef = useRef(null);
  const navigate = useNavigate();

  // 카드 없으면 자동으로 새 카드 모드
  useEffect(() => {
    if (savedCards.length === 0 || isFetchingError) {
      setUseNewCard(true);
    }
  }, []);

  const placeOrderWithSavedCard = async () => {
    abortControllerRef.current?.abort();
    abortControllerRef.current = new AbortController();
    const paymentService = new PaymentService(
      abortControllerRef.current.signal,
      () => accessToken,
    );

    setIsPayProcessing(true);
    setErrorMsg("");

    try {
      await paymentService.chargeSavedCard(orderId, selectedCardId);
      queryClient.invalidateQueries({ queryKey: ["savedCards", userId] });
      navigate(`/order/completed/${orderId}`, { replace: true });
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

  return (
    <main className="min-h-screen flex justify-center items-start py-20 px-4">
      <section className="w-full max-w-lg bg-gray-600 shadow-2xl rounded-xl p-8 border border-gray-700">
        {errorMsg && (
          <div className="mb-4">
            <ErrorAlert title="There was a problem" message={errorMsg} />
          </div>
        )}
        *
        <h2
          className={`text-2xl font-semibold text-gray-200 mb-6 pb-3 border-b`}
        >
          Payment method
        </h2>
        <div className="flex flex-col gap-5">
          {savedCards?.map((card) => (
            <SavedCard
              key={card.id}
              card={card}
              orderId={orderId}
              selectedCardId={selectedCardId}
              setSelectedCardId={setSelectedCardId}
            />
          ))}

          {savedCards.length > 0 && (
            <Button
              onClick={() => setUseNewCard(true)}
              className="text-yellow-300 hover:text-yellow-400 bg-gray-500"
            >
              Add a credit / debit card
            </Button>
          )}

          {useNewCard && clientSecret && (
            <Elements stripe={stripePromise} options={elementsOptions}>
              <PaymentFormWrapper orderId={orderId} />
            </Elements>
          )}

          {selectedCardId && !useNewCard && (
            <Button
              onClick={placeOrderWithSavedCard}
              disabled={isPayProcessing}
            >
              {isPayProcessing ? <SpinnerMini /> : "Place an order"}
            </Button> // 기존 카드로 결제
          )}

          {useNewCard && savedCards.length > 0 && (
            <Button onClick={() => setUseNewCard(false)}>
              Use saved card instead
            </Button>
          )}
        </div>
      </section>
    </main>
  );
}
