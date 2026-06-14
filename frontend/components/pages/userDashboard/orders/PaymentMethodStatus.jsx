export default function PaymentMethodStatus({ statusMsg }) {
  return (
    <div className="border rounded-lg p-5">
      <p className="font-semibold text-white mb-3">Payment method</p>

      <div className="flex items-center gap-3">
        <div className="text-3xl">💳</div>

        <div>
          <p className="text-gray-300 font-small mt-2">{statusMsg}</p>
        </div>
      </div>
    </div>
  );
}
