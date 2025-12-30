import pool from "../config/db.js";

export async function saveShippingInfo(userId, address) {
  const q = `
    INSERT INTO addresses (user_id, street, postal_code, city, phone, full_name)
    VALUES ($1, $2, $3, $4, $5, $6)
    RETURNING id
    `;

  const values = [
    userId,
    address.street,
    address.postal_code,
    address.city,
    address.phone,
    address.full_name,
  ];

  try {
    const result = await pool.query(q, values);
    return result.rows[0].id;
  } catch (err) {
    console.error("DB insert error", err.message);
    throw err;
  }
}
