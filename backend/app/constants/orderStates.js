export const CANCELLABLE_PAYMENT_STATUSES = [
  "requires_confirmation",
  "requires_action",
  "failed",
];

export const ORDER_CANCEL_WINDOW_MINUTES = 7;

export const ORDER_STATUS = {
  PENDING: "pending",
  PAID: "paid",
  CANCELED: "canceled",
  EXPIRED: "expired",
};

export const PAYMENT_STATUS = {
  REQUIRES_PAYMENT: "requires_payment",
  SUCCEEDED: "succeeded",
  CANCELED: "canceled",
  REFUND_PENDING: "refund_pending",
  EXPIRED: "expired",
};

export const REFUND_STATUS = {
  FAILED: "failed",
  CANCELED: "canceled",
  PENDING: "pending",
  SUCCEEDED: "succeeded",
};
