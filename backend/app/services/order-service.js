import pool from "../config/db.js";

export async function createOrder(
  client,
  userId,
  addressId,
  subTotalAmount,
  deliveryFee,
  taxAmount,
  totalAmount,
  address,
) {
  const q = `
   INSERT INTO orders (
    user_id, address_id, subtotal_amount, delivery_fee, tax_amount, total_amount,
    shipping_full_name, shipping_street, shipping_city, shipping_state, shipping_postal_code, shipping_phone)
   VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12)
   RETURNING id
    `;

  const values = [
    userId,
    addressId,
    subTotalAmount,
    deliveryFee,
    taxAmount,
    totalAmount,
    address.full_name,
    address.street,
    address.city,
    address.state,
    address.postal_code,
    address.phone,
  ];
  const result = await client.query(q, values);
  return result.rows[0].id;
}

export async function getAllOrders(userId, { cursor = null, limit = 10 }) {
  let cursorClause = "";
  let values = [userId, limit + 1];

  if (cursor) {
    values.push(cursor.created_at);
    values.push(cursor.id);

    cursorClause = `AND (o.created_at, o.id) < ($3::timestamptz, $4::int)`;
  }

  const q = `
  SELECT 
    o.id, o.created_at, o.total_amount, o.status,
    p.payment_status,
    COUNT(DISTINCT oi.id) AS item_count,
    JSON_AGG(
        JSON_BUILD_OBJECT(
          'menu_id', m.id,
          'name', m.name,
          'image', m.image,
          'price', oi.price,
          'qty', oi.qty
        )
        ORDER BY oi.id  
    ) AS preview_items
  FROM orders o
  JOIN payments p ON p.order_id = o.id
  JOIN order_items oi ON oi.order_id = o.id
  JOIN menus m ON m.id = oi.menu_id
  WHERE o.user_id = $1
    AND p.payment_status NOT IN ('requires_payment', 'canceled')
    ${cursorClause}
  GROUP BY o.id, o.created_at, o.total_amount, o.status, p.payment_status
  ORDER BY o.created_at DESC, o.id DESC 
  LIMIT $2
  `;

  const result = await pool.query(q, values);
  const hasMore = result.rows.length > limit;
  const orders = hasMore ? result.rows.slice(0, limit) : result.rows;
  const lastOrder = orders[orders.length - 1];

  // 다음 cursor는 마지막 row의 created_at + id
  const nextCursor = hasMore
    ? { created_at: lastOrder.created_at.toISOString(), id: lastOrder.id }
    : null;

  return { orders, nextCursor };
}

export async function getExpiredPendingOrders() {
  const q = `
    SELECT o.id
    FROM orders o
    JOIN payments p ON p.order_id = o.id
    WHERE o.status = 'pending' 
      AND p.payment_status = 'requires_payment'
      AND p.created_at <= NOW() - INTERVAL '30 minutes';
  `;
  const result = await pool.query(q);
  return result.rows;
}

export async function getOrderById(orderId) {
  const q = `
  SELECT user_id, total_amount, status, created_at
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
      o.id, o.created_at, o.status,
      o.total_amount, o.subtotal_amount, o.tax_amount, o.delivery_fee,
      o.shipping_street, o.shipping_city, o.shipping_state, o.shipping_postal_code, 
      o.shipping_phone, o.shipping_full_name,
      p.payment_status, p.stripe_payment_method_id,

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
      LEFT JOIN payments p ON p.order_id = o.id
      JOIN order_items oi ON oi.order_id = o.id
      JOIN menus m ON m.id = oi.menu_id
      WHERE o.id = $1 AND o.user_id = $2
      GROUP BY o.id, p.payment_status, p.stripe_payment_method_id
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

export async function updateOrderStatus(client, orderId, newStatus) {
  const ALLOWED_TRANSITIONS = {
    pending: ["paid", "canceled"],
    paid: ["canceled"],
  };

  // 현재 상태 조회
  // FOR UPDATE: SELECT 결과를 곧 UPDATE할 예정이니까 잠가둔다
  const { rows } = await client.query(
    `SELECT status FROM orders WHERE id = $1 FOR UPDATE`,
    [orderId],
  );

  if (rows.length === 0) {
    throw new Error("ORDER_NOT_FOUND");
  }

  const currentStatus = rows[0].status; // 'pending', 'paid'

  if (currentStatus === newStatus) return { success: true };

  const allowed = ALLOWED_TRANSITIONS[currentStatus] ?? [];
  if (!allowed.includes(newStatus)) {
    throw new Error("ORDER_STATUS_CONFLICT");
  }

  const q = `
    UPDATE orders
    SET status = $1
    WHERE id = $2
    AND status = $3
    `;

  const values = [newStatus, orderId, currentStatus];
  const result = await client.query(q, values);

  if (result.rowCount === 0) {
    throw new Error("ORDER_STATUS_CONFLICT"); // 이미 paid였거나, orderId가 잘못됐거나
  }

  return { success: true };
}
