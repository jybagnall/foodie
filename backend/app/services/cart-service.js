import pool from "../config/db.js";

// user_id가 겹치면(ON CONFLICT) 업데이트 시간만 바꿩(DO UPDATE)
// UPDATE를 안 쓰는 이유: 카트가 존재하지 않으면 아무 일도 안 일어남.
export async function saveCurrentCart(client, userId) {
  const q = `
     INSERT INTO saved_carts (user_id)
     VALUES ($1)
     ON CONFLICT (user_id)
     DO UPDATE SET updated_at = NOW()
     RETURNING id
     `;
  const values = [userId];
  try {
    const result = await client.query(q, values);
    return result.rows[0].id;
  } catch (err) {
    console.error("DB insert error", err.message);
    throw err;
  }
}

export async function saveCurrentCartItems(client, cartId, items = []) {
  // NOTE: this is called inside a transaction
  const delete_q = `
    DELETE FROM saved_cart_items 
    WHERE cart_id = $1
    `;
  await client.query(delete_q, [cartId]);

  if (!items.length) {
    return;
  }

  const values = [];
  const placeholders = items.map((item, index) => {
    if (!item.menuId || !Number.isInteger(item.qty) || item.qty <= 0) {
      throw new Error("Invalid cart item payload");
    }

    const baseIndex = index * 3;
    values.push(cartId, item.menuId, item.qty);
    return `($${baseIndex + 1}, $${baseIndex + 2}, $${baseIndex + 3})`;
  });

  const insert_q = `
    INSERT INTO saved_cart_items (cart_id, menu_id, qty)
    VALUES ${placeholders.join(", ")}
    `;

  await client.query(insert_q, values);
}
