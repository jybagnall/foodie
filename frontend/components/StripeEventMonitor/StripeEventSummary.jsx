export default function StripeEventSummary({ statusSummary }) {
  return (
    <div className="text-2xl font-semibold text-gray-800 mb-6 border-b pb-3">
      <p>Dead Events: {statusSummary.dead}</p>
      <p>Failed Events: {statusSummary.failed}</p>
    </div>
  );
}
