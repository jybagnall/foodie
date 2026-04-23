import { useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import useSavedCards from "../../../hooks/useSavedCards";
import Button from "../../UI/Button";
import ErrorAlert from "../../user_feedback/ErrorAlert";
import Spinner from "../../user_feedback/Spinner";
import SavedCard from "./SavedCard";
import PaymentService from "../../../services/payment.service";
import { getUserErrorMessage } from "../../../utils/getUserErrorMsg";

// isFetchingError 가 있어도 새 카드 입력창만 나오면 됨
export default function PaymentMethodSelector({
  orderId,
  onUseNewCard,
  children,
}) {
  const { savedCards, isFetching, isFetchingError } = useSavedCards();
  const [selectedCardId, setSelectedCardId] = useState(null);
  const [isPayProcessing, setIsPayProcessing] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");
  const abortControllerRef = useRef(null);
  const navigate = useNavigate();

  useEffect(() => {
    if (!isFetching && savedCards.length === 0) {
      onUseNewCard();
    }
  }, [isFetching, savedCards, onUseNewCard]);

  const placeOrderWithSavedCard = async () => {
    abortControllerRef.current?.abort();
    abortControllerRef.current = new AbortController();
    const paymentService = new PaymentService(
      abortControllerRef.current.signal,
    );

    setIsPayProcessing(true);
    setErrorMsg("");

    try {
      await paymentService.chargeSavedCard(orderId, selectedCardId);
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
        {/* {isFetchingError && (
          <div className="mb-4">
            <ErrorAlert title="There was a problem" message="" />
          </div>
        )} */}

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
              onClick={onUseNewCard}
              className="text-yellow-300 hover:text-yellow-400 bg-gray-500"
            >
              Add a credit / debit card
            </Button>
          )}
          {children}

          {selectedCardId && (
            <Button
              onClick={placeOrderWithSavedCard}
              disabled={isPayProcessing}
            >
              Place an order
            </Button>
          )}
        </div>
      </section>
    </main>
  );
}
