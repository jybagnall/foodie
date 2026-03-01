import { useContext, useEffect, useState, useCallback, useMemo } from "react";
import AuthContext from "../../contexts/AuthContext";
import StripeService from "../../services/stripe.service";
import {
  XMarkIcon,
  ExclamationTriangleIcon,
} from "@heroicons/react/24/outline";

export default function StripeErrorBanner() {
  const [count, setCount] = useState(0);
  const [lastSeenTime, setLastSeenTime] = useState(null);
  const { accessToken } = useContext(AuthContext);

  const stripeService = useMemo(() => {
    return new StripeService(new AbortController(), () => accessToken);
  }, [accessToken]);

  const fetchData = useCallback(async () => {
    try {
      const { count, lastSeenTime } =
        await stripeService.getStripeDeadEventsCount();
      setCount(count);
      setLastSeenTime(lastSeenTime);
    } catch (err) {
      console.error(err);
    }
  }, [stripeService]);

  useEffect(() => {
    const run = () => {
      fetchData();
    };

    run();

    const intervalId = setInterval(run, 30000);

    return () => clearInterval(intervalId);
  }, [fetchData]);

  const markDeadEventsNotified = async (time) => {
    try {
      await stripeService.markStripeEventsAsNotified(time);
      await fetchData();
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
        <button
          onClick={() => markDeadEventsNotified(lastSeenTime)}
          className="underline"
        >
          Confirm
        </button>

        <button
          onClick={() => markDeadEventsNotified(lastSeenTime)}
          className="font-bold cursor-pointer"
        >
          <XMarkIcon className="h-5 w-5" />
        </button>
      </div>
    </div>
  );
}
