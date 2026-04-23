import pool from "../config/db.js";

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
