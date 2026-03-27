import pool from "../config/db.js";

export async function getAllAddresses(userId) {
  const q = `
    SELECT id, street, postal_code, city, phone, full_name, is_default
    FROM addresses
    WHERE user_id = $1
    `;

  try {
    const result = await pool.query(q, [userId]);
    return Array.isArray(result?.rows) ? result.rows : [];
  } catch (err) {
    console.error("DB fetch error:", err.message);
    return [];
  }
}

export async function getDefaultAddress(userId) {
  const q = `
  SELECT id, street, postal_code, city, phone, full_name, is_default
  FROM addresses
  WHERE user_id = $1
  AND is_default = TRUE 
  LIMIT 1;
  `;
  const result = await pool.query(q, [userId]);
  return result.rows[0] || null;
}

export async function saveShippingInfo(client, userId, address) {
  if (address.is_default) {
    await updateDefaultAddress(client, userId);
  } // 유저가 기본 배송지 설정을 원함

  const q = `
    INSERT INTO addresses (user_id, street, postal_code, city, phone, full_name, is_default)
    VALUES ($1, $2, $3, $4, $5, $6, $7)
    RETURNING id
    `;

  const values = [
    userId,
    address.street,
    address.postal_code,
    address.city,
    address.phone,
    address.full_name,
    address.is_default ?? false,
  ];

  try {
    const result = await client.query(q, values);
    return result.rows[0].id;
  } catch (err) {
    console.error("DB insert error", err.message);
    throw err;
  }
}

// 새 주소 추가(기존 기본 배송지 없으면 0 rows affected) & 기존 주소 변경
export async function updateDefaultAddress(client, userId) {
  const q = `
    UPDATE addresses 
    SET is_default = FALSE
    WHERE user_id = $1
    AND is_default = TRUE
    `;
  await client.query(q, [userId]);
}
