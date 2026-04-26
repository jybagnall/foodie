import pool from "../config/db.js";

export async function createPaymentRecord(
  orderId,
  paymentIntentId,
  amount,
  currency,
) {
  const q = `
    INSERT INTO payments (order_id, stripe_payment_intent_id, amount, currency)
    VALUES ($1, $2, $3, $4)
  `;
  const values = [orderId, paymentIntentId, amount, currency];

  await pool.query(q, values);
  return { success: true };
}

export async function findUniquePaymentByOrderId(orderId) {
  const q = `
  SELECT 
    stripe_payment_intent_id,
    stripe_charge_id,
    payment_status,
    amount,
    paid_at,
    currency
  FROM payments
  WHERE order_id = $1
  `;
  const result = await pool.query(q, [orderId]);
  return result.rows[0];
}

export async function markPaymentFailed(client, paymentIntentId, failureMsg) {
  const q = `
    UPDATE payments
    SET payment_status = 'failed', 
        failure_reason = $1,
        updated_at = NOW()
    WHERE stripe_payment_intent_id = $2
    `;
  const values = [failureMsg, paymentIntentId];

  await client.query(q, values);
  return { success: true };
}

export async function updatePaymentMethod(client, paymentMethodId, orderId) {
  const q = `
    UPDATE payments 
    SET payment_method_id = $1 
    WHERE order_id = $2
  `;
  const values = [paymentMethodId, orderId];
  await client.query(q, values);
  return { success: true };
}

// 📍webhook 상태 저장
// INSERT → 첫 webhook일 때 (status = 'processing')
// Stripe 재시도로 같은 이벤트가 들어왔다면 시간과 상태 업데이트 필수
// id가 이미 존재하면 INSERT는 실패하고 UPDATE로 전환됨
// EXCLUDED: INSERT 하려고 했지만 실패했던 새로운 status 값
// <>: "같지 않다"
export async function upsertPaymentFromIntent(client, paymentDetails) {
  const q = `
    INSERT INTO payments (
      order_id,
      stripe_payment_intent_id,
      stripe_payment_method_id,
      amount,
      currency,
      payment_status,
      stripe_charge_id,
      paid_at
      )
    VALUES ($1, $2, $3, $4, $5, $6, $7, NOW())
    ON CONFLICT (stripe_payment_intent_id)
    DO UPDATE
    SET 
      payment_status = EXCLUDED.payment_status,
      stripe_charge_id = EXCLUDED.stripe_charge_id,
      updated_at = NOW(),
      paid_at = NOW()
    WHERE payments.payment_status <> 'succeeded'
    `;

  const values = [
    paymentDetails.order_id,
    paymentDetails.stripe_payment_intent_id,
    paymentDetails.stripe_payment_method_id,
    paymentDetails.amount,
    paymentDetails.currency,
    paymentDetails.payment_status,
    paymentDetails.stripe_charge_id,
  ];

  await client.query(q, values);
  return { success: true };
}
