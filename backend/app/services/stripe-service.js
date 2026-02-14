import { savePaymentInfo, updatePaymentStatus } from "./payment-service.js";
import { updateOrderStatus } from "./order-service.js";

// 여기서의 실패: DB 저장 실패, 주문 상태 업데이트 실패, 트랜잭션 롤백, 서버 장애
// 이 실패들은 유저에게 실시간으로 보여줄 수 없음.
export async function handlePaymentIntentSucceeded(client, paymentIntent) {
  const expandedIntent = await stripe.paymentIntents.retrieve(
    paymentIntent.id,
    {
      expand: ["latest_charge"], // 이 값은 아이디 말고, 실제 객체로 펼쳐줘
    },
  );

  const orderId = paymentIntent.metadata.orderId;
  if (!orderId) {
    throw new Error("Missing orderId in paymentIntent metadata");
  }

  await savePaymentInfo(client, {
    order_id: orderId,
    stripe_payment_intent_id: paymentIntent.id,
    stripe_customer_id: paymentIntent.customer,
    amount: paymentIntent.amount / 100,
    currency: paymentIntent.currency,
    payment_status: paymentIntent.status,
    receipt_url: expandedIntent.latest_change?.receipt_url ?? null, // 결제 내역 보기
  });

  await updatePaymentStatus(client, orderId, "paid");
  await updateOrderStatus(client, orderId, "paid");
}

export async function handlePaymentIntentFailed(client, paymentIntent) {
  const orderId = paymentIntent.metadata.orderId;
  if (!orderId) return;

  await updatePaymentStatus(client, orderId, "failed");
}
