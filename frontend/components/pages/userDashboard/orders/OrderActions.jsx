import { Link } from "react-router-dom";
import { useQueryClient } from "@tanstack/react-query";
import useAccessToken from "../../../../hooks/useAccessToken";
import useUserId from "../../../../hooks/useUserId";
import { useEffect } from "react";
import { useState } from "react";

export default function OrderActions({ order }) {
  const accessToken = useAccessToken();
  const userId = useUserId();
  const queryClient = useQueryClient();

  // Stripe는 에러를 throw하지 않고, return 값의 error로 줌.
  const cancelOrder = async () => {};

  return (
    <div className="flex flex-row gap-2 sm:flex-col sm:gap-3 sm:min-w-[140px] mt-0 sm:mt-5">
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

// ["order", orderId]
// import { useQuery, useQueryClient } from "@tanstack/react-query";
