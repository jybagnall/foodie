import { useContext, useEffect, useState } from "react";
import AuthContext from "../../contexts/AuthContext";
import StripeService from "../../services/stripe.service";
import {
  XMarkIcon,
  ExclamationTriangleIcon,
} from "@heroicons/react/24/outline";
import { useMemo } from "react";

export default function StripeErrorBanner() {
  const [count, setCount] = useState(0);
  const { accessToken } = useContext(AuthContext);

  const stripeService = useMemo(() => {
    return new StripeService(new AbortController(), () => accessToken);
  }, [accessToken]);

  useEffect(() => {
    let isMounted = true; // 언마운트 후 상태 변경 방지용 장치
    let timeoutId;

    const fetchData = async () => {
      try {
        const data = await stripeService.getStripeDeadEventsCount();
        if (isMounted) setCount(data); // 컴포넌트가 살아있으므로 업데이트
      } catch (err) {
        console.error(err);
      } finally {
        if (isMounted) {
          timeoutId = setTimeout(fetchData, 30000); // 30초 후 실행
        }
      }
    };

    fetchData(); // 즉시 실행

    return () => {
      isMounted = false;
      clearTimeout(timeoutId); // 예약된 함수 제거
    };
  }, [stripeService]);

  const markDeadEventsNotified = async () => {
    try {
      await stripeService.markStripeEventsAsNotified();
      setCount(0);
    } catch (err) {
      console.error(err);
    }
  };

  const showBanner = count > 0;
  if (!showBanner) return null;

  return (
    <div className="fixed top-0 left-0 w-full bg-red-600 text-white px-4 py-3 flex justify-between items-center z-50 shadow-lg">
      <div className="flex justify-between items-center">
        <span className="mr-2">
          <ExclamationTriangleIcon className="h-5 w-5" />
        </span>
        <span> {count} Stripe events failed to process.</span>
      </div>

      <div className="flex gap-3 cursor-pointer">
        <button onClick={markDeadEventsNotified} className="underline">
          Confirm
        </button>

        <button
          onClick={markDeadEventsNotified}
          className="font-bold cursor-pointer"
        >
          <XMarkIcon className="h-5 w-5" />
        </button>
      </div>
    </div>
  );
}
