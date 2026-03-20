import {
  upsertPaymentFromIntent,
  markPaymentFailed,
} from "../../services/payment-service.js";
import { updateOrderStatus } from "../../services/order-service.js";

// 여기서의 실패: DB 저장 실패, 주문 상태 업데이트 실패, 트랜잭션 롤백, 서버 장애
// 이 실패들은 유저에게 실시간으로 보여줄 수 없음.

// metadata는 모든 값이 string으로 저장됨
// ❗try, catch 필요하지 않음?
export async function handlePaymentIntentSucceeded(client, paymentIntent) {
  const orderId = Number(paymentIntent.metadata?.orderId);

  if (!paymentIntent.id) {
    throw new Error("Missing id in paymentIntent");
  }
  if (!orderId)
    throw new Error(
      `Missing orderId. intentId: ${paymentIntent.id}, metadata: ${JSON.stringify(paymentIntent.metadata)}`,
    );

  await upsertPaymentFromIntent(client, {
    order_id: orderId,
    stripe_payment_intent_id: paymentIntent.id,
    amount: paymentIntent.amount_received / 100,
    currency: paymentIntent.currency,
    payment_status: paymentIntent.status,
    stripe_charge_id: paymentIntent.latest_charge,
  });

  await updateOrderStatus(client, orderId, "paid");
}

export async function handlePaymentIntentFailed(client, paymentIntent) {
  const failureMsg = paymentIntent.last_payment_error?.message;

  if (!paymentIntent.id) {
    console.warn(
      "handlePaymentIntentFailed: missing paymentIntent.id, skipping",
      paymentIntent,
    );
    return;
  }

  await markPaymentFailed(client, paymentIntent.id, failureMsg);
}
