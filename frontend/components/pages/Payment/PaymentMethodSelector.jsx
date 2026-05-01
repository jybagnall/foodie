import { useEffect, useMemo, useRef, useState } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { loadStripe } from "@stripe/stripe-js";
import { Elements } from "@stripe/react-stripe-js";
import { useNavigate } from "react-router-dom";
import useSavedCards from "../../../hooks/useSavedCards";
import Button from "../../UI/Button";
import ErrorAlert from "../../user_feedback/ErrorAlert";
import SavedCard from "./SavedCard";
import PaymentFormWrapper from "./PaymentFormWrapper";
import Spinner from "../../user_feedback/Spinner";
import useAccessToken from "../../../hooks/useAccessToken";
import useUserId from "../../../hooks/useUserId";
import SpinnerMini from "../../user_feedback/SpinnerMini";
import { getUserErrorMessage } from "../../../utils/getUserErrorMsg";
import { markAsFromPayment } from "../../../storage/paymentStorage";
import PaymentService from "../../../services/payment.service";
import DeliverySummary from "../../OrderUI/DeliverySummary";
import OrderSummary from "../../OrderUI/OrderSummary";

const stripePromise = loadStripe(import.meta.env.VITE_STRIPE_PUBLISHABLE_KEY);

export default function PaymentMethodSelector({
  order,
  orderId,
  useNewCard,
  setUseNewCard,
  clientSecret,
}) {
  const { savedCards, isFetching, isFetchingError } = useSavedCards();
  const [selectedCardId, setSelectedCardId] = useState(null);
  const [errorMsg, setErrorMsg] = useState("");
  const [isPayProcessing, setIsPayProcessing] = useState(false);
  const accessToken = useAccessToken();
  const userId = useUserId();
  const queryClient = useQueryClient();
  const abortControllerRef = useRef(null);
  const navigate = useNavigate();

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
      paymentMethodOrder: ["card"], // 카드 사용만 허용
    }),
    [clientSecret],
  );

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
      const { paymentIntent } = await paymentService.chargeSavedCard(
        orderId,
        selectedCardId,
      );
      markAsFromPayment();
      navigate(
        `/order/completed/${orderId}?payment_intent=${paymentIntent.id}`,
        {
          replace: true, // 뒤로가기에 이 페이지 삭제
          state: { from: "payment" }, // 리디렉팅 시 상태도 몰래 보냄
        },
      ); // 결제의 흐름이 끝났다는 의미의 이동 (3DS 없음)

      queryClient.invalidateQueries({ queryKey: ["savedCards", userId] });
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
        <DeliverySummary order={order} />

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
        <div>
          <OrderSummary order={order} />
          {selectedCardId && (
            <Button
              onClick={placeOrderWithSavedCard}
              disabled={isPayProcessing}
              className="text-yellow-300 hover:text-yellow-400 bg-gray-500 mt-5"
            >
              {isPayProcessing ? <SpinnerMini /> : "Place an order"}
            </Button>
          )}
        </div>
      </section>
    </main>
  );
}
