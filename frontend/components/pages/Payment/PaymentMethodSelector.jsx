import { useEffect, useRef, useState } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { useStripe } from "@stripe/react-stripe-js";
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

export default function PaymentMethodSelector({ order, orderId }) {
  const [useNewCard, setUseNewCard] = useState(false);
  const [selectedCardId, setSelectedCardId] = useState(null);
  const [errorMsg, setErrorMsg] = useState("");
  const [isPayProcessing, setIsPayProcessing] = useState(false);
  const accessToken = useAccessToken();
  const { savedCards, isFetching, isFetchingError } = useSavedCards();
  const userId = useUserId();
  const queryClient = useQueryClient();
  const stripe = useStripe();
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
      const { paymentIntent, requiresAction, clientSecret } =
        await paymentService.chargeSavedCard(orderId, selectedCardId);

      if (requiresAction) {
        await stripe.handleNextAction({ clientSecret });
        return; // 유저가 이미 페이지를 벗어남. 인증 후 Stripe가 return_url로 리디렉트
      } // 대부분 3DS. 유저의 추가 인증이 필요

      markAsFromPayment();
      queryClient.invalidateQueries({ queryKey: ["savedCards", userId] });
      navigate(
        `/order/completed/${orderId}?payment_intent=${paymentIntent.id}`,
        {
          replace: true, // 뒤로가기에 이 페이지 삭제
          state: { from: "payment" }, // 리디렉팅 시 상태도 몰래 보냄
        },
      ); // 결제의 흐름이 끝났다는 의미의 이동 (3DS 없음)
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
          <div className="mt-6 grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* LEFT SIDE */}
            <div className="lg:col-span-2 space-y-6">
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

              <div className="lg:col-span-1 space-y-6">
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
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}
