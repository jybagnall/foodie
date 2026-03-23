const PAYMENT_STATUS_KEY = "from_payment";

export function getFromPayment() {
  return sessionStorage.getItem(PAYMENT_STATUS_KEY);
}

export function clearFromPayment() {
  sessionStorage.removeItem(PAYMENT_STATUS_KEY);
}

export function markAsFromPayment() {
  sessionStorage.setItem(PAYMENT_STATUS_KEY, "true");
}
