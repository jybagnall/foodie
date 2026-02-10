import { savePaymentInfo, updatePaymentStatus } from "./payment-service.js";
import pool from "../config/db.js";

// 여기서의 실패: DB 저장 실패, 주문 상태 업데이트 실패, 트랜잭션 롤백, 서버 장애
// 이 실패들은 유저에게 실시간으로 보여줄 수 없음.
export async function handlePaymentIntentSucceeded(paymentIntent) {
  const client = await pool.connect();
  try {
    await client.query("BEGIN");
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
      receipt_url: paymentIntent.charges?.data?.[0]?.receipt_url ?? null, // 결제 내역 보기
    });

    await updatePaymentStatus(client, orderId, "paid");
    await client.query("COMMIT");
  } catch (err) {
    await client.query("ROLLBACK");
    throw err;
  } finally {
    client.release();
  }
}

export async function handlePaymentIntentFailed(paymentIntent) {
  const client = await pool.connect();
  try {
    const orderId = paymentIntent.metadata.orderId;
    if (!orderId) return;

    await client.query("BEGIN");
    await updatePaymentStatus(client, orderId, "failed");
    await client.query("COMMIT");
  } catch (err) {
    await client.query("ROLLBACK");
    throw err;
  } finally {
    client.release();
  }
}
