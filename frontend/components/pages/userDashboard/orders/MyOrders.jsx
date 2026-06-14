import { useEffect, useRef, useCallback } from "react";
import useMyOrders from "../../../../hooks/useMyOrders";
import Spinner from "../../../user_feedback/Spinner";
import PageError from "../../../user_feedback/PageError";
import { ShoppingBagIcon } from "@heroicons/react/24/outline";
import EmptyDataState from "../../../UI/EmptyDataState";
import OrderCard from "./OrderCard";
import SpinnerMini from "../../../user_feedback/SpinnerMini";

export default function MyOrders() {
  const {
    orders,
    ordersFetchingError,
    isFetchingOrders,
    isFetchingNextPage,
    fetchNextPage,
    hasNextPage,
  } = useMyOrders();

  const observerRef = useRef(null); // IntersectionObserver 객체를 저장

  const hasNextPageRef = useRef(hasNextPage); // 첫 렌더 때 최신값 저장
  const isFetchingNextPageRef = useRef(isFetchingNextPage); // 첫 렌더 때 최신값 저장

  useEffect(() => {
    document.title = "Orders | Foodie";
  }, []);

  // ref 동기화 전용 — 매 렌더마다 실행
  // ref 는 자동으로 값이 안 변함, 따라서
  // 매 렌더마다 최신값으로 동기화를 위해 dependency 없음
  useEffect(() => {
    hasNextPageRef.current = hasNextPage;
    isFetchingNextPageRef.current = isFetchingNextPage;
  });

  // DOM이 생성될 때 React가 setBottomBoundaryRef 함수를 호출
  // node: <div class="h-4"></div>

  const setBottomBoundaryRef = useCallback(
    (node) => {
      if (observerRef.current) {
        observerRef.current.disconnect();
      }
      // 기존 Observer가 있으면 연결 해제
      // 같은 DOM을 여러 Observer가 감시하는 상황 방지,
      // fetchNextPage() 중복 실행 방지

      if (!node) return; // DOM이 없으면 종료

      observerRef.current = new IntersectionObserver(
        (entries) => {
          const entry = entries[0]; // 현재 감시 중인 요소 정보

          if (
            entry.isIntersecting &&
            hasNextPageRef.current &&
            !isFetchingNextPageRef.current
          ) {
            fetchNextPage();
          }
        },
        {
          rootMargin: "200px",
        }, // 200px 전에 감지
      );

      observerRef.current.observe(node);
    },
    [fetchNextPage],
  );

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
        <div ref={setBottomBoundaryRef} className="h-4" />

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
