import {
  XMarkIcon,
  ExclamationTriangleIcon,
} from "@heroicons/react/24/outline";
import { useContext } from "react";
import useStripeEventMonitor from "../../hooks/useStripeEventMonitor";
import AuthContext from "../../contexts/AuthContext";
//deadSummary = { count: 0, lastSeenTime: null }

export default function StripeErrorBanner() {
  const { accessToken } = useContext(AuthContext);
  const { deadSummary, confirmDeadEvents } = useStripeEventMonitor(accessToken);

  const showBanner = deadSummary.count > 0;
  if (!showBanner) return null;

  return (
    <div className="fixed top-0 left-0 w-full bg-red-600 text-white px-4 py-3 flex justify-between items-center z-50 shadow-lg">
      <div className="flex justify-between items-center">
        <span className="mr-2">
          <ExclamationTriangleIcon className="h-5 w-5" />
        </span>
        <span> {deadSummary.count} Stripe events failed to process.</span>
      </div>

      <div className="flex gap-3 cursor-pointer">
        <button
          onClick={() => {
            confirmDeadEvents(deadSummary.lastSeenTime);
          }}
          className="font-bold cursor-pointer"
        >
          <XMarkIcon className="h-5 w-5" />
        </button>
      </div>
    </div>
  );
}
