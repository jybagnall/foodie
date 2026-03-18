import pool from "../config/db.js";

export async function findUniquePayment(orderId) {
  const q = `
  SELECT stripe_payment_intent_id
  FROM payments
  WHERE order_id = $1
  `;
  const result = await pool.query(q, [orderId]);
  return result.rows[0];
}

export async function linkOrderPaymentMethod() {
  const q = `
    INSERT INTO order_payments (order_id, payment_method_id)
    VALUES ($1, $2)
    ON CONFLICT (order_id) DO NOTHING
  `;
  try {
    await pool.query(q, [orderId, paymentMethodId]);
    return { success: true };
  } catch (err) {
    console.error("DB insert error", err.message);
    throw err;
  }
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

  try {
    await client.query(q, values);
    return { success: true };
  } catch (err) {
    console.error("DB update error", err.message);
    throw err;
  }
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
      amount,
      currency,
      payment_status,
      stripe_charge_id,
      paid_at
      )
    VALUES ($1, $2, $3, $4, $5, $6, NOW())
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
    paymentDetails.amount,
    paymentDetails.currency,
    paymentDetails.payment_status,
    paymentDetails.stripe_charge_id,
  ];

  try {
    await client.query(q, values);
    return { success: true };
  } catch (err) {
    console.error("DB insert error", err.message);
    throw err;
  }
}

export async function upsertPaymentMethod(card) {
  const q = `
    INSERT INTO payment_methods (
      stripe_payment_method_id,
      brand,
      last4,
      exp_month,
      exp_year
    )
    VALUES ($1, $2, $3, $4, $5)
    ON CONFLICT (stripe_payment_method_id)
    DO UPDATE SET
      brand = EXCLUDED.brand,
      last4 = EXCLUDED.last4,
      exp_month = EXCLUDED.exp_month,
      exp_year = EXCLUDED.exp_year
    RETURNING id
  `;

  const values = [
    card.payment_method_id, // pm_xxx
    card.brand,
    card.last4,
    card.exp_month,
    card.exp_year,
  ];

  const { rows } = await pool.query(q, values);
  return rows[0].id;
}
