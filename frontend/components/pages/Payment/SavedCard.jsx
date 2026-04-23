import { useState } from "react";

export default function SavedCard({
  card,
  orderId,
  selectedCardId,
  setSelectedCardId,
}) {
  const isSelected = card.id === selectedCardId;

  const handleSelect = () => {
    setSelectedCardId(card.id);
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
        {/* 카드 배경 */}
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

        {/* 글래스 효과 */}
        <div className="absolute inset-0 rounded-2xl backdrop-blur-xl bg-white/5" />

        {/* Shine 효과 */}
        <div className="absolute inset-0 rounded-2xl bg-gradient-to-tr from-white/10 via-transparent to-transparent" />

        {/* 컨텐츠 */}
        <div className="relative z-10 flex flex-col justify-between h-40">
          {/* 상단 */}
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

          {/* 카드 번호 */}
          <div className="text-xl font-mono tracking-[0.2em]">
            •••• •••• •••• {card.last4}
          </div>

          {/* 하단 */}
          <div className="flex justify-between items-end text-sm">
            <div>
              <div className="opacity-70 text-xs">EXP</div>
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
    </div>
  );
}
