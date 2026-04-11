import { Link } from "react-router-dom";

export default function OrderActions({ order }) {
  return (
    <div className="flex flex-row gap-2 sm:flex-col sm:gap-3 sm:min-w-[140px] mt-5">
      <Link
        to={`/my-account/orders/${order.id}`}
        className="flex-1 sm:flex-none text-center border border-gray-300 shadow-md rounded-sm p-3 text-yellow-500 font-bold text-base cursor-pointer"
      >
        Order Details
      </Link>
      <button className="flex-1 sm:flex-none border border-gray-300 shadow-md rounded-sm p-3 text-gray-300 text-base cursor-pointer">
        Cancel Order
      </button>
    </div>
  );
}
