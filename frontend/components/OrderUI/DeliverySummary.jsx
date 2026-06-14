import { formatPhone } from "../../utils/format";

export default function DeliverySummary({ order }) {
  return (
    <div className="border rounded-lg p-5 border-gray-300">
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div>
          <p className="font-semibold text-gray-200">Shipping method</p>
          <p className="text-sm text-gray-400">CJ Korea Express</p>
        </div>
        <div>
          <p className="font-semibold text-gray-200">Shipping address</p>
          <p className="text-sm text-gray-400">
            {order.shipping_street}, {order.shipping_city},{" "}
            {order.shipping_state}
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
