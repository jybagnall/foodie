import { formatPhone } from "../../utils/format";

export default function DeliverySummary({ order }) {
  return (
    <div className="border rounded-lg p-5">
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div>
          <p className="font-semibold">Shipping method</p>
          <p className="text-sm text-gray-400">CJ Korea Express</p>
        </div>
        <div>
          <p className="font-semibold">Shipping address</p>
          <p className="text-sm text-gray-400">
            {order.shipping_street}, {order.shipping_city}
            <br />
            {order.shipping_postal_code}
            <br />
            {order.shipping_full_name}
            <br />
            {formatPhone(order.shipping_phone)}
          </p>
        </div>
      </div>
    </div>
  );
}
