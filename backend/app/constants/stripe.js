export const STRIPE_HANDLED_EVENTS = [
  "payment_intent.succeeded",
  "payment_intent.payment_failed",
  "refund.updated", // 카드사에서 환불 처리됨
];

export const DEFAULT_CURRENCY = "usd";
export const SUPPORTED_STRIPE_PAYMENT_METHODS = ["card"];

export const STRIPE_RETRY_MAX_ATTEMPTS = 3;
export const STRIPE_RETRY_BASE_DELAY_MS = 200;

export const STRIPE_METADATA_USER_ID = "userId";
export const STRIPE_METADATA_ORDER_ID = "orderId";
export const STRIPE_METADATA_SAVE_CARD = "saveCard";
export const STRIPE_METADATA_SET_AS_DEFAULT = "setAsDefault";

export const STRIPE_PAYMENT_INTENT_ID_PREFIX = "pi_";

export const STRIPE_ERROR_CODE = {
  RESOURCE_MISSING: "resource_missing",
};

export const STRIPE_ERROR_TYPE = {
  INVALID_REQUEST: "StripeInvalidRequestError",
};

export const STRIPE_PAYMENT_INTENT_STATUS = {
  REQUIRES_ACTION: "requires_action",
  REQUIRES_PAYMENT_METHOD: "requires_payment_method",
  REQUIRES_CONFIRMATION: "requires_confirmation",
  REQUIRES_CAPTURE: "requires_capture",
  PROCESSING: "processing",
  SUCCEEDED: "succeeded",
  CANCELED: "canceled",
};

export function toStripeAmount(amount) {
  return Math.round(amount * 100);
}

export function getStripePaymentReturnUrl(orderId) {
  return `${process.env.FRONTEND_PUBLIC_URL}/order/payment/${orderId}`;
}
