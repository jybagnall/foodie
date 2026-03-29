import pool from "../config/db.js";

// BEGIN;
// UPDATE addresses SET is_default = FALSE WHERE user_id = $1;
// UPDATE addresses SET is_default = TRUE WHERE id = $2 AND user_id = $1;
// -- user_id 조건을 같이 걸어야 다른 유저의 주소를 변경하는 걸 막을 수 있습니다
// COMMIT;

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

  // 이미 배송 정보가 있다면 is_default만 업데이트
  const q = `
    INSERT INTO addresses (user_id, street, postal_code, city, phone, full_name, is_default)
    VALUES ($1, $2, $3, $4, $5, $6, $7)
    ON CONFLICT (user_id, street, postal_code, city, phone, full_name)
    DO UPDATE SET is_default = EXCLUDED.is_default
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

  const result = await client.query(q, values);
  return result.rows[0].id;
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
