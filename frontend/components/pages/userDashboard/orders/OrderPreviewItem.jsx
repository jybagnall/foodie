export default function OrderPreviewItem({ item }) {
  return (
    <div className="flex items-center rounded-xl px-5 pt-3">
      <img
        src={item.image}
        alt={item.name}
        className="w-20 h-20 sm:w-24 sm:h-24 rounded-lg object-cover shadow-[0_0_4px_4px_rgba(255,255,255,0.5)]"
      />
      <div className="ml-4">
        <p className="font-medium text-sm sm:text-base">{item.name}</p>
        <p className="text-xs sm:text-sm text-gray-300">Qty: {item.qty}</p>
        <div className="mt-2 flex flex-wrap gap-2">
          <button
            onClick={() => {}}
            className="text-sm font-medium text-gray-300 cursor-pointer border border-gray-300 shadow-md rounded-sm p-1"
          >
            Write a review
          </button>
          <button
            onClick={() => {}}
            className="text-sm font-medium text-gray-300 cursor-pointer border border-gray-300 shadow-md rounded-sm p-1"
          >
            Buy Again
          </button>
        </div>
      </div>
    </div>
  );
}
