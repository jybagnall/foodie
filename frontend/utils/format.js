import dayjs from "dayjs";

// Intl.NumberFormat이라는 내장 클래스를 이용해서
// “숫자를 통화 형식으로 바꿔주는 객체”를 만드는 것.
// 따라서 이 객체가 가지고 있는 메서드 .format()을 써서 실제 변환을 수행함
// currencyFormatter.format(12.59)
export const currencyFormatter = new Intl.NumberFormat("en-US", {
  style: "currency",
  currency: "USD",
});

export const formatDateTime = (date) => {
  if (!date) return "-";
  return dayjs(date).format("YYYY-MM-DD HH:mm");
};

export const formatDateOnly = (date) => {
  if (!date) return "-";
  return dayjs(date).format("MMMM D, YYYY");
};

export function getTimeRangeStart(rangeKey) {
  if (!rangeKey) return null;

  const now = new Date();

  const ranges = {
    "30m": 30 * 60 * 1000,
    "1h": 60 * 60 * 1000,
    "3h": 3 * 60 * 60 * 1000,
    "6h": 6 * 60 * 60 * 1000,
    "12h": 12 * 60 * 60 * 1000,
    "24h": 24 * 60 * 60 * 1000,
  };

  const diff = ranges[rangeKey];
  if (!diff) return null;

  return new Date(now.getTime() - diff).toISOString();
} // ISO 문자열로 변환: "2026-02-22T05:12:31.234Z"

export const formatPhone = (phone) => {
  return phone.replace(/(\d{3})(\d{4})(\d{4})/, "$1-$2-$3");
};

export function formatPaymentStatus(status) {
  const map = {
    requires_payment: "Awaiting Payment",
    requires_confirmation: "Confirming",
    requires_action: "Action Required",
    processing: "Processing",
    succeeded: "Paid",
    canceled: "Canceled",
    failed: "Payment Failed",
    refunded: "Refunded",
  };
  return map[status] ?? status;
}

export function formatOrderStatus(status) {
  const map = {
    pending: "Order Received",
    paid: "Payment Confirmed",
    preparing: "Preparing",
    delivered: "Delivered",
    cancelled: "Cancelled",
  };
  return map[status] ?? status;
}
