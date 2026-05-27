export default function CartHeader({
  allChecked,
  setAllChecked,
  checkedItemQty,
  totalItemCount,
}) {
  return (
    <div className="flex justify-between items-center mt-2 mb-4">
      <div className="flex items-center gap-2">
        {/* name attribute는 폼 제출 시 필요함 */}
        {/* <label>의 htmlFor과 id가 연결되면 텍스트 클릭 시 체크박스가 토글됨 */}

        <input
          checked={allChecked}
          onChange={(e) => setAllChecked(e.target.checked)}
          id="all"
          type="checkbox"
          aria-label="Select all menu"
          className="w-5 h-5 cursor-pointer rounded-sm border border-gray-100 checked:bg-gray-400 checked:border-gray-300 transition-colors"
        />
        <label htmlFor="all" className="cursor-pointer text-gray-200">
          Select all
          <span className="ml-2 font-semibold">{checkedItemQty}</span>/
          <span className="font-semibold">{totalItemCount}</span>
        </label>
      </div>
    </div>
  );
}
