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

export async function savePaymentInfo(paymentDetails) {
  const q = `
    INSERT INTO payments (
      user_id,
      order_id,
      stripe_payment_intent_id,
      stripe_customer_id,
      amount,
      currency,
      payment_status,
      payment_method,
      receipt_url,
      card_brand,
      card_last4,
      card_exp_month,
      card_exp_year)
    VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13)
    `;

  const values = [
    paymentDetails.user_id,
    paymentDetails.order_id,
    paymentDetails.stripe_payment_intent_id,
    paymentDetails.stripe_customer_id,
    paymentDetails.amount,
    paymentDetails.currency,
    paymentDetails.payment_status,
    paymentDetails.payment_method,
    paymentDetails.receipt_url,
    paymentDetails.card_brand,
    paymentDetails.card_last4,
    paymentDetails.card_exp_month,
    paymentDetails.card_exp_year,
  ];

  try {
    await pool.query(q, values);
    return { success: true };
  } catch (err) {
    console.error("DB insert error", err.message);
    throw err;
  }
}

export async function updatePaymentStatus(paymentId, status = "refunded") {
  const q = `
    UPDATE payments
    SET payment_status = $1, updated_at = NOW()
    WHERE id = $2
    `;
  const values = [status, paymentId];

  try {
    await pool.query(q, values);
    return { success: true };
  } catch (err) {
    console.error("DB update error", err.message);
    throw err;
  }
}
