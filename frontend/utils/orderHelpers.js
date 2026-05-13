export function buildOrderDetails(shippingInfo, items) {
  return {
    address: {
      full_name: shippingInfo.full_name.trim(),
      street: shippingInfo.street.trim(),
      city: shippingInfo.city.trim(),
      postal_code: String(shippingInfo.postal_code).trim(),
      phone: shippingInfo.phone.trim(),
      is_default: shippingInfo.is_default,
    },
    orderPayload: {
      items: items.map((i) => ({
        menu_name: i.name,
        menu_id: i.id,
        qty: i.qty,
      })),
    },
  };
}

const UNPAID_STATUSES = [
  "requires_payment",
  "requires_confirmation",
  "requires_action",
  "processing",
  "failed",
];

const PAYMENT_WINDOW_DAYS = 7;

function formatPaymentStatus(status) {
  const map = {
    requires_payment: "Awaiting Payment",
    requires_confirmation: "Confirming",
    requires_action: "Action Required",
    processing: "Processing",
    canceled: "Canceled",
    failed: "Payment Failed",
    refunded: "Refunded",
    refund_pending: "Refund Pending",
    expired: "Order Expired",
  };
  return map[status] ?? status;
}

function formatOrderStatus(status) {
  const map = {
    pending: "Order Received",
    paid: "Payment Confirmed",
    preparing: "Preparing",
    delivered: "Delivered",
    cancelled: "Cancelled",
  };
  return map[status] ?? status;
}

export function getDisplayOrderStatus(order) {
  const orderDate = new Date(order.created_at);

  const daysSinceOrder =
    (Date.now() - orderDate.getTime()) / (1000 * 60 * 60 * 24);

  const isPaymentWindowExpired =
    UNPAID_STATUSES.includes(order.payment_status) &&
    daysSinceOrder >= PAYMENT_WINDOW_DAYS;

  if (isPaymentWindowExpired) return formatPaymentStatus("expired");

  if (order.payment_status === "succeeded")
    return formatOrderStatus(order.status);

  return formatPaymentStatus(order.payment_status);
}
