export const STRIPE_HANDLED_EVENTS = [
  "payment_intent.succeeded",
  "payment_intent.payment_failed",
  "refund.updated", // 카드사에서 환불 처리됨
];
