import {
  handlePaymentIntentSucceeded,
  handlePaymentIntentFailed,
} from "./stripe-handlers.js";

export async function handleStripeEvent(client, event) {
  switch (event.type) {
    case "payment_intent.succeeded":
      await handlePaymentIntentSucceeded(client, event.data.object);
      return { ignored: false };
    case "payment_intent.payment_failed":
      await handlePaymentIntentFailed(client, event.data.object);
      return { ignored: false };
    default:
      return { ignored: true };
  }
}

// payment_intent.payment_failed가 되는 예:
// 잔액 부족, 카드 만료, 카드 분실, 도난, 한도 초과, 카드사 거절,
// 3D Secure 인증 실패 또는 취소, CVC 불일치
