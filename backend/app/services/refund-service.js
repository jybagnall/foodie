import pool from "../config/db.js";

export async function createRefundRecord(
  client,
  { paymentId, stripeRefundId, amount, refundStatus, reason },
) {
  const completedAt = refundStatus === "succeeded" ? new Date() : null;

  const q = `
    INSERT INTO refunds (
        payment_id, 
        stripe_refund_id, 
        amount, 
        refund_status, 
        reason, 
        completed_at
    )
    VALUES ($1, $2, $3, $4, $5, $6)
  `;
  const values = [
    paymentId,
    stripeRefundId,
    amount,
    refundStatus,
    reason,
    completedAt,
  ];

  await client.query(q, values);
  return { success: true };
}

export async function markRefundAsCompleted(client, newStatus, stripeRefundId) {
  const q = `
    UPDATE refunds 
    SET 
      refund_status = $1, 
      completed_at = NOW()
    WHERE stripe_refund_id = $2
  `;
  const values = [newStatus, stripeRefundId];

  await client.query(q, values);
  return { success: true };
}

export async function refundRecordExists(client, refundId) {
  const q = `
    SELECT payment_id, refund_status
    FROM refunds
    WHERE stripe_refund_id = $1
  `;

  const result = await client.query(q, [refundId]);
  return result.rows.length > 0;
}
