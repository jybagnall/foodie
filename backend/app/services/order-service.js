import pool from "../config/db.js";

export async function createOrderId(userId, addressId, totalAmount) {
  const q = `
   INSERT INTO orders (user_id, address_id, total_amount)
   VALUES ($1, $2, $3)
   RETURNING id
    `;

  const values = [userId, addressId, totalAmount];

  try {
    const result = await pool.query(q, values);
    return result.rows[0].id;
  } catch (err) {
    console.error("DB insert error", err.message);
    throw err;
  }
}

export async function insertOrderItems(orderId, order) {
  const values = [];
  const placeholders = [];

  order.items.forEach((item, i) => {
    const baseIndex = i * 3;
    placeholders.push(
      `($1, $${baseIndex + 2}, $${baseIndex + 3}, $${baseIndex + 4})`,
    );
    values.push(item.menu_id, item.qty, item.price);
  });

  if (placeholders.length === 0) {
    console.warn("insertOrderItems called with no items, skipping insert.");
    return;
  }

  const q = `
   INSERT INTO order_items (order_id, menu_id, qty, price)
   VALUES ${placeholders.join(", ")}
    `;

  try {
    await pool.query(q, [orderId, ...values]);
  } catch (err) {
    console.error("DB insert error", err.message);
    throw err;
  }
}

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

export async function updateOrderStatus(status, orderId) {
  const q = `
    UPDATE orders
    SET status = $1
    WHERE id = $2
    `;

  const values = [status, orderId];
  try {
    await pool.query(q, values);
    return { success: true };
  } catch (err) {
    console.error("DB update error", err.message);
    throw err;
  }
}
