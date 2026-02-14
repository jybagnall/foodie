import pool from "../config/db.js";

export async function findUniqueOrder(orderId) {
  const q = `
  SELECT *
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
    ON CONFLICT (order_id) DO NOTHING;
  `;
  try {
    await pool.query(q, [orderId, paymentMethodId]);
    return { success: true };
  } catch (err) {
    console.error("DB insert error", err.message);
    throw err;
  }
}

export async function savePaymentInfo(client, paymentDetails) {
  const q = `
    INSERT INTO payments (
      order_id,
      stripe_payment_intent_id,
      stripe_customer_id,
      amount,
      currency,
      payment_status,
      receipt_url
      )
    VALUES ($1, $2, $3, $4, $5, $6, $7)
    `;

  const values = [
    paymentDetails.order_id,
    paymentDetails.stripe_payment_intent_id,
    paymentDetails.stripe_customer_id,
    paymentDetails.amount,
    paymentDetails.currency,
    paymentDetails.payment_status,
    paymentDetails.receipt_url,
  ];

  try {
    await client.query(q, values);
    return { success: true };
  } catch (err) {
    console.error("DB insert error", err.message);
    throw err;
  }
}

// "refunded"가 왜 기본값일까
export async function updatePaymentStatus(
  client,
  orderId,
  status = "refunded",
) {
  const q = `
    UPDATE payments
    SET payment_status = $1, 
        updated_at = NOW()
    WHERE order_id = $2
      AND payment_status != 'paid'
    `;
  const values = [status, orderId];

  try {
    await client.query(q, values);
    return { success: true };
  } catch (err) {
    console.error("DB update error", err.message);
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
    RETURNING id;
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
