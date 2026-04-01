import pool from "../config/db.js";

export async function createOrderId(
  client,
  userId,
  addressId,
  totalAmount,
  address,
) {
  const q = `
   INSERT INTO orders (
    user_id, address_id, total_amount,
    shipping_full_name, shipping_street, shipping_city, shipping_postal_code, shipping_phone)
   VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
   RETURNING id
    `;

  const values = [
    userId,
    addressId,
    totalAmount,
    address.full_name,
    address.street,
    address.city,
    address.postal_code,
    address.phone,
  ];
  const result = await client.query(q, values);
  return result.rows[0].id;
}

export async function getOrderById(orderId) {
  const q = `
  SELECT user_id, total_amount
  FROM orders
  WHERE id = $1
  `;
  const result = await pool.query(q, [orderId]);
  return result.rows[0];
}

export async function getOrderConfirmationDetails(client, orderId) {
  const q = `
  SELECT 
    u.email,
    a.full_name, a.street, a.city, a.postal_code, a.phone
  FROM orders o
  JOIN addresses a ON o.address_id = a.id
  JOIN users u ON o.user_id = u.id
  WHERE o.id = $1
  `;
  const result = await client.query(q, [orderId]);
  return result.rows[0];
}

// [{ menu_name, menu_id, qty, price }, {}]
export async function insertOrderItems(client, orderId, order) {
  const values = [];
  const placeholders = [];

  order.forEach((item, i) => {
    const baseIndex = i * 3;
    placeholders.push(
      `($1, $${baseIndex + 2}, $${baseIndex + 3}, $${baseIndex + 4})`,
    );
    values.push(item.menu_id, item.qty, item.price);
  });

  if (placeholders.length === 0) {
    throw new Error("insertOrderItems called with no items, skipping insert.");
  }

  const q = `
   INSERT INTO order_items (order_id, menu_id, qty, price)
   VALUES ${placeholders.join(", ")}
    `;

  await client.query(q, [orderId, ...values]);
}

export async function updateOrderStatus(client, orderId, status) {
  const q = `
    UPDATE orders
    SET status = $1
    WHERE id = $2
    AND status = 'pending'
    `;

  const values = [status, orderId];

  const result = await client.query(q, values);

  if (result.rowCount === 0) {
    console.warn(
      `Order ${orderId} not updated - already ${status} or not found`,
    ); // 이미 paid였거나, orderId가 잘못됐거나
  }

  return { success: true };
}
