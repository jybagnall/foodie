export function calculateOrderTotal(order) {
  return order.reduce((sum, item) => sum + item.price * item.qty, 0);
}

// undefined: "브라우저가 알아서 유저 지역(locale)을 넣어라"
// 미국 유저: $12.34 한국 유저: US$12.34
export function formatCurrency(currency, amount_received) {
  if (!currency) return "";

  return new Intl.NumberFormat(undefined, {
    style: "currency",
    currency: currency.toUpperCase(),
  }).format(amount_received / 100);
}
