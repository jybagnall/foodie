import { useEffect, useRef } from "react";
import useMyOrders from "../../../../hooks/useMyOrders";
import Spinner from "../../../user_feedback/Spinner";
import PageError from "../../../user_feedback/PageError";
import { ShoppingBagIcon } from "@heroicons/react/24/outline";
import EmptyDataState from "../../../UI/EmptyDataState";
import OrderCard from "./OrderCard";
import SpinnerMini from "../../../user_feedback/SpinnerMini";

// {id, created_at, total_amount, payment_status, item_count, preview_items= {name, image, qty}}
export default function MyOrders() {
  const {
    orders,
    ordersFetchingError,
    isFetchingOrders,
    isFetchingNextPage,
    fetchNextPage,
    hasNextPage,
  } = useMyOrders();

  // 다음 페이지를 불러올 감시용 DOM 요소
  const loadMoreTriggerRef = useRef(null);
  const hasNextPageRef = useRef(hasNextPage);
  const isFetchingNextPageRef = useRef(isFetchingNextPage);

  useEffect(() => {
    document.title = "Orders | Foodie";
  }, []);

  // ref 동기화 전용 — 매 렌더마다 실행
  // 매 렌더마다 최신값으로 동기화

  useEffect(() => {
    hasNextPageRef.current = hasNextPage;
    isFetchingNextPageRef.current = isFetchingNextPage;
  }); // dependency 없음

  useEffect(() => {
    const sentinelElement = loadMoreTriggerRef.current; // 감시용 div
    if (!sentinelElement) return; // 아직 감시할 DOM 요소가 생성 안 됨.

    const observer = new IntersectionObserver(
      (entries) => {
        const entry = entries[0];

        if (
          entry.isIntersecting &&
          hasNextPageRef.current &&
          !isFetchingNextPageRef.current
        ) {
          const result = fetchNextPage();
        }
      },
      {
        threshold: 0.1,
        rootMargin: "0px 0px 200px 0px",
        // viewport 아래 200px 전에 미리 감지
      },
    );
    observer.observe(sentinelElement); // 감시용 div를 관찰해
    return () => observer.disconnect();
  }, [fetchNextPage]);

  if (isFetchingOrders) return <Spinner />;
  if (ordersFetchingError) return <PageError />;
  if (orders.length === 0)
    return (
      <EmptyDataState
        icon={ShoppingBagIcon}
        title="No orders yet"
        message="Looks like you haven't placed any orders yet."
      />
    );

  return (
    <div className="container mx-auto px-4 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-3xl">
        <p className="font-bold text-xl">Orders</p>
        {orders.map((order) => (
          <OrderCard key={order.id} order={order} />
        ))}

        {/* 이 요소가 viewport에 들어오면 다음 페이지 fetch */}
        <div ref={loadMoreTriggerRef} className="h-4" />

        {isFetchingNextPage && (
          <div className="flex justify-center py-4">
            <SpinnerMini />
          </div>
        )}

        {!hasNextPage && orders.length > 0 && (
          <p className="text-center text-sm text-gray-400 py-6">
            No more orders to load.
          </p>
        )}
      </div>
    </div>
  );
}
