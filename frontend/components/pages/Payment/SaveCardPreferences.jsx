export default function SaveCardPreferences({
  saveCard,
  setSaveCard,
  setAsDefault,
  setSetAsDefault,
}) {
  return (
    <div className="mt-4 flex flex-col gap-3 text-md text-gray-200">
      <label className="flex items-center gap-2 cursor-pointer">
        <input
          type="checkbox"
          checked={saveCard}
          onChange={(e) => {
            const checked = e.target.checked;
            setSaveCard(checked);
            if (!checked) setSetAsDefault(false); // 저장 안 하면 default도 해제
          }}
          className="accent-yellow-400"
        />
        Save this card for future payments
      </label>

      {/* 기본 카드 설정 */}
      <label className="flex items-center gap-2 cursor-pointer">
        <input
          type="checkbox"
          checked={setAsDefault}
          disabled={!saveCard}
          onChange={(e) => setSetAsDefault(e.target.checked)}
          className="accent-yellow-400 disabled:opacity-50"
        />
        Set as default payment method
      </label>
    </div>
  );
}
