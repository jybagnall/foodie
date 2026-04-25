import { useEffect, useMemo, useState } from "react";
import { loadStripe } from "@stripe/stripe-js";
import { Elements } from "@stripe/react-stripe-js";
import useSavedCards from "../../../hooks/useSavedCards";
import Button from "../../UI/Button";
import ErrorAlert from "../../user_feedback/ErrorAlert";
import SavedCard from "./SavedCard";
import PaymentFormWrapper from "./PaymentFormWrapper";
import Spinner from "../../user_feedback/Spinner";

const stripePromise = loadStripe(import.meta.env.VITE_STRIPE_PUBLISHABLE_KEY);

export default function PaymentMethodSelector({
  orderId,
  useNewCard,
  setUseNewCard,
  clientSecret,
}) {
  const { savedCards, isFetching, isFetchingError } = useSavedCards();
  const [selectedCardId, setSelectedCardId] = useState(null);
  const [errorMsg, setErrorMsg] = useState("");

  // 카드 없으면 자동으로 새 카드 모드
  useEffect(() => {
    if (isFetching) return; // ❗이 로직의 부재가 에러의 원인

    if (savedCards.length === 0 || isFetchingError) {
      setUseNewCard(true);
    }
  }, [isFetching]);

  const elementsOptions = useMemo(
    () => ({
      clientSecret,
      appearance: {
        theme: "night", // dark 기반 추천
        variables: {
          colorBackground: "#4b5563", // gray-700
          colorText: "#D1D5DB", // gray-300
          colorPrimary: "#babec5", // 버튼/포커스 색도 맞춤
          colorDanger: "#ef4444", // 에러 (Tailwind red-500)
          colorBorder: "#637081", // gray-600 (경계선 자연스럽게)
        },
      },
    }),
    [clientSecret],
  );

  if (isFetching) return <Spinner />;

  if (useNewCard) {
    if (!clientSecret) return <Spinner />;
    return (
      <Elements stripe={stripePromise} options={elementsOptions}>
        <PaymentFormWrapper orderId={orderId} />
      </Elements>
    );
  }

  return (
    <main className="min-h-screen flex justify-center items-start py-20 px-4">
      <section className="w-full max-w-lg bg-gray-600 shadow-2xl rounded-xl p-8 border border-gray-700">
        {errorMsg && (
          <div className="mb-4">
            <ErrorAlert title="There was a problem" message={errorMsg} />
          </div>
        )}

        <h2
          className={`text-2xl font-semibold text-gray-200 mb-6 pb-3 border-b`}
        >
          Payment method
        </h2>
        <div className="flex flex-col gap-5">
          {savedCards.map((card) => (
            <SavedCard
              key={card.id}
              card={card}
              orderId={orderId}
              selectedCardId={selectedCardId}
              setSelectedCardId={setSelectedCardId}
              setErrorMsg={setErrorMsg}
            />
          ))}
          <Button
            onClick={() => setUseNewCard(true)}
            className="text-yellow-300 hover:text-yellow-400 bg-gray-500"
          >
            Add a credit / debit card
          </Button>
        </div>
      </section>
    </main>
  );
}

// {
//   useNewCard && savedCards.length > 0 && (
//     <Button onClick={() => setUseNewCard(false)}>Use saved card instead</Button>
//   );
// }
