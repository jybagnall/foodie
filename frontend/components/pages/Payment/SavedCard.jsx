import { useRef, useState } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { useNavigate } from "react-router-dom";
import Button from "../../UI/Button";
import SpinnerMini from "../../user_feedback/SpinnerMini";
import useAccessToken from "../../../hooks/useAccessToken";
import useUserId from "../../../hooks/useUserId";
import PaymentService from "../../../services/payment.service";
import { markAsFromPayment } from "../../../storage/paymentStorage";
import { getUserErrorMessage } from "../../../utils/getUserErrorMsg";

export default function SavedCard({
  card,
  orderId,
  selectedCardId,
  setSelectedCardId,
  setErrorMsg,
}) {
  const [isPayProcessing, setIsPayProcessing] = useState(false);
  const accessToken = useAccessToken();
  const userId = useUserId();
  const queryClient = useQueryClient();
  const abortControllerRef = useRef(null);
  const navigate = useNavigate();

  const isSelected = card.id === selectedCardId;

  const handleSelect = () => {
    setSelectedCardId(card.id);
  };

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

  return (
    <div className="perspective-1000">
      <div
        onClick={handleSelect}
        className={`
          relative cursor-pointer rounded-2xl p-5 text-white
          transition-all duration-300 transform
          ${isSelected ? "scale-105 ring-2 ring-blue-400" : "hover:scale-[1.02]"}
        `}
      >
        <div
          className={`
            absolute inset-0 rounded-2xl
            ${
              isSelected
                ? "bg-gradient-to-br from-blue-600 via-indigo-600 to-purple-600"
                : "bg-gradient-to-br from-gray-800 to-gray-900"
            }
          `}
        />

        <div className="absolute inset-0 rounded-2xl backdrop-blur-xl bg-white/5" />
        <div className="absolute inset-0 rounded-2xl bg-gradient-to-tr from-white/10 via-transparent to-transparent" />
        <div className="relative z-10 flex flex-col justify-between h-18">
          <div className="flex justify-between items-center">
            <span className="uppercase text-sm tracking-widest opacity-80">
              {card.brand}
            </span>

            {card.is_default && (
              <span className="text-xs bg-white/20 px-2 py-1 rounded-full backdrop-blur">
                Default
              </span>
            )}
          </div>

          <div className="text-xl font-mono tracking-[0.2em]">
            •••• •••• •••• {card.last4}
          </div>

          <div className="flex justify-between items-end text-sm">
            <div>
              <div className="opacity-70 text-[10px] leading-none">EXP</div>
              <div>
                {String(card.exp_month).padStart(2, "0")}/
                {String(card.exp_year).slice(-2)}
              </div>
            </div>

            {isSelected && (
              <div className="text-xs font-semibold text-blue-200">
                Selected
              </div>
            )}
          </div>
        </div>
      </div>
      {isSelected && (
        <Button
          onClick={placeOrderWithSavedCard}
          disabled={isPayProcessing}
          className="text-yellow-300 hover:text-yellow-400 bg-gray-500 mt-5"
        >
          {isPayProcessing ? <SpinnerMini /> : "Place an order"}
        </Button> // 기존 카드로 결제
      )}
    </div>
  );
}
