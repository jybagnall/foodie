import { stripe } from "../config/stripe.js";
import {
  FREE_DELIVERY_THRESHOLD,
  DELIVERY_FEE,
  STATE_TAX_RATES,
} from "../constants/delivery.js";
import { calculateStripeTax } from "../integrations/stripe/tax.js";

export function calculateOrderSubTotal(order) {
  const subTotalAmount = order.reduce(
    (sum, item) => sum + item.price * item.qty,
    0,
  );

  return parseFloat(subTotalAmount.toFixed(2));
}

export function calculateOrderTotal(amount) {
  return parseFloat(amount.toFixed(2));
}

export function calculateDeliveryFee(subtotal) {
  return subtotal >= FREE_DELIVERY_THRESHOLD ? 0 : DELIVERY_FEE;
}

export function calculateTaxForTest(subTotal, deliveryFee, address) {
  const rate = STATE_TAX_RATES[address.state.toUpperCase()] ?? 0;
  return parseFloat(((subTotal + deliveryFee) * rate).toFixed(2));
}

export async function calculateTax(subTotal, deliveryFee, address) {
  const taxCalculation = await calculateStripeTax({
    subTotal,
    deliveryFee,
    address,
  });

  return parseFloat((taxCalculation.tax_amount_exclusive / 100).toFixed(2));
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

export function isWithinCancellationWindow(orderCreatedAt, days) {
  const orderDate = new Date(orderCreatedAt);

  if (isNaN(orderDate.getTime())) return false;

  const daysSinceOrder =
    (Date.now() - orderDate.getTime()) / (1000 * 60 * 60 * 24);

  return daysSinceOrder <= days;
}
