export default function StripeEventSummary({ erroredEventCounts }) {
  return (
    <div className="text-2xl font-semibold text-gray-200 mb-6 border-b pb-3">
      <p>Dead Events: {erroredEventCounts.deadCount}</p>
      <p>Failed Events: {erroredEventCounts.failedCount}</p>
    </div>
  );
}
