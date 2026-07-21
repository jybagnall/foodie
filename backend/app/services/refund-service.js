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
    ON CONFLICT (stripe_refund_id) DO NOTHING
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
}

// 이미 succeeded가 된 환불은 절대 다시 변경하지 않는다.
export async function markRefundAsCompleted(client, newStatus, stripeRefundId) {
  const completedAt = newStatus === "succeeded" ? new Date() : null;

  const q = `
    UPDATE refunds 
    SET 
      refund_status = $1, 
      completed_at = $2
    WHERE stripe_refund_id = $3
    AND refund_status <> 'succeeded'
  `;
  const values = [newStatus, completedAt, stripeRefundId];

  await client.query(q, values);
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
