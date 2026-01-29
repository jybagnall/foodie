import pool from "../config/db.js";

export async function saveCurrentCart(userId, addressId, totalAmount) {
  //   const q = `
  //    INSERT INTO orders (user_id, address_id, total_amount)
  //    VALUES ($1, $2, $3)
  //    RETURNING id
  //     `;
  //   const values = [userId, addressId, totalAmount];
  //   try {
  //     const result = await pool.query(q, values);
  //     return result.rows[0].id;
  //   } catch (err) {
  //     console.error("DB insert error", err.message);
  //     throw err;
  //   }
}
