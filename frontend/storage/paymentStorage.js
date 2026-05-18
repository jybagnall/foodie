const PAYMENT_FLOW_ACCESS_KEY = "from_payment";

export function grantPaymentFlowAccess() {
  sessionStorage.setItem(PAYMENT_FLOW_ACCESS_KEY, "true");
} // "지금 결제 흐름 진행 중"

export function hasPaymentFlowAccess() {
  return sessionStorage.getItem(PAYMENT_FLOW_ACCESS_KEY);
} // "이 유저가 결제 흐름에서 왔나?"

export function revokePaymentFlowAccess() {
  sessionStorage.removeItem(PAYMENT_FLOW_ACCESS_KEY);
} // "결제 흐름 종료"

// 결제 완료 페이지에 접근을 허용할 수 있는 정상 결제 플로우인가
