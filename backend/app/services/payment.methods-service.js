import pool from "../config/db.js";

export async function clearDefaultCard(client, userId) {
  const q = `
    UPDATE payment_methods
    SET is_default = FALSE
    WHERE user_id = $1
    AND is_default = TRUE
    `;
  await client.query(q, [userId]);
}

export async function getCardsInfo(userId) {
  const q = `
  SELECT 
    id, stripe_payment_method_id, brand, last4, exp_month, exp_year, is_default, created_at
  FROM payment_methods
  WHERE user_id = $1
  `;

  const result = await pool.query(q, [userId]);
  return result.rows ?? [];
}

export async function identifyCardByUserId(cardId, userId) {
  const q = `
    SELECT id, stripe_payment_method_id
    FROM payment_methods
    WHERE id = $1 AND user_id = $2
  `;
  const result = await pool.query(q, [cardId, userId]);
  return result.rows[0] ?? null;
}

export async function saveCardToDb(
  client,
  stripePaymentMethod,
  userId,
  setAsDefault,
) {
  const q = `
    INSERT INTO payment_methods (
    user_id, stripe_payment_method_id, brand, last4, exp_month, exp_year, is_default
    )
    VALUES ($1, $2, $3, $4, $5, $6, $7)
    ON CONFLICT (stripe_payment_method_id)
    DO UPDATE SET
      brand = EXCLUDED.brand,
      last4 = EXCLUDED.last4,
      exp_month = EXCLUDED.exp_month,
      exp_year = EXCLUDED.exp_year
    RETURNING id
  `;
  const values = [
    userId,
    stripePaymentMethod.id,
    stripePaymentMethod.card.brand,
    stripePaymentMethod.card.last4,
    stripePaymentMethod.card.exp_month,
    stripePaymentMethod.card.exp_year,
    setAsDefault,
  ];
  const { rows } = await client.query(q, values);
  return rows[0]?.id ?? null;
}
