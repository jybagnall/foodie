import InfoBlockSkeleton from "../../../UI/InfoBlockSkeleton";

export default function PaymentMethodCard({
  paymentMethod,
  isFetching,
  fetchingError,
}) {
  if (isFetching) return <InfoBlockSkeleton />;

  const { brand, last4, exp_month, exp_year } = paymentMethod ?? {};

  return (
    <div className="border rounded-lg p-5">
      <p className="font-semibold text-white mb-3">Payment method</p>

      <div className="flex items-center gap-3">
        <div className="text-2xl">💳</div>
        {fetchingError ? (
          <p className="text-gray-100 font-medium">
            Payment method unavailable
          </p>
        ) : (
          <div>
            <p className="text-gray-100 font-medium">
              {brand} •••• {last4}
            </p>

            <p className="text-sm text-gray-400">
              Expires {exp_month}/{exp_year}
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
