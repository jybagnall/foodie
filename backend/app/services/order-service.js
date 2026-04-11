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

export async function getAllOrders(userId) {
  const q = `
  SELECT 
    o.id, o.created_at, o.total_amount, o.status,
    p.payment_status,
    COUNT(DISTINCT oi.id) AS item_count,
    
    (
      SELECT JSON_AGG(
        JSON_BUILD_OBJECT(
          'name', m.name,
          'image', m.image,
          'price', oi2.price,
          'qty', oi2.qty
        )
      )
      FROM (
        SELECT oi2.qty, oi2.menu_id, oi2.price
        FROM order_items oi2
        WHERE oi2.order_id = o.id
        ORDER BY oi2.id
      ) AS oi2
      JOIN menus m 
        ON oi2.menu_id = m.id
    ) AS preview_items

  FROM orders o
  JOIN payments p 
    ON p.order_id = o.id
  JOIN order_items oi 
    ON oi.order_id = o.id
  WHERE o.user_id = $1
  GROUP BY o.id, o.created_at, o.total_amount, o.status, 
           p.payment_status
  ORDER BY o.created_at DESC
  `;

  const result = await pool.query(q, [userId]);
  return result.rows;
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

export async function getOrderDetails(orderId, userId) {
  const q = `
    SELECT
      o.id, o.created_at, o.total_amount, o.status, o.shipping_street, 
      o.shipping_city, o.shipping_postal_code, 
      o.shipping_phone, o.shipping_full_name,
      p.payment_status,

      JSON_AGG( 
          JSON_BUILD_OBJECT(
            'menu_id', m.id,
            'name', m.name,
            'image', m.image,
            'price', oi.price,
            'qty', oi.qty
          )
          ORDER BY oi.id
      ) AS items

      FROM orders o
      JOIN payments p ON p.order_id = o.id
      JOIN order_items oi ON oi.order_id = o.id
      JOIN menus m ON m.id = oi.menu_id
      WHERE o.id = $1 AND o.user_id = $2
      GROUP BY o.id, p.payment_status
  `;
  const result = await pool.query(q, [orderId, userId]);
  return result.rows[0] ?? null;
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
