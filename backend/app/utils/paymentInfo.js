export function formatPaymentMethodDisplay(paymentInfo) {
  const { method, brand, last4 } = paymentInfo;

  switch (method) {
    case "card":
      return `${capitalize(brand)} •••• ${last4}`;

    case "paypal":
      return "PayPal";

    default:
      return capitalize(method); // fallback
  }
}

function capitalize(str) {
  if (!str) return "";
  return str.charAt(0).toUpperCase() + str.slice(1);
}
