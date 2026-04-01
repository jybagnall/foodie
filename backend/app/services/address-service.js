import pool from "../config/db.js";

// 새 주소 추가(기존 기본 배송지 없으면 0 rows affected) & 기존 주소 변경
export async function clearDefaultAddress(client, userId) {
  const q = `
    UPDATE addresses 
    SET is_default = FALSE
    WHERE user_id = $1
    AND is_default = TRUE
    `;
  await client.query(q, [userId]);
}

export async function createUserAddress(client, payload, userId) {
  const { full_name, street, city, postal_code, phone, is_default } = payload;
  const q = `
    INSERT INTO addresses (full_name, user_id, street, city, postal_code, phone, is_default)
    VALUES ($1, $2, $3, $4, $5, $6, $7)
    RETURNING id, full_name, street, city, postal_code, phone, is_default
    `;
  const values = [
    full_name,
    userId,
    street,
    city,
    postal_code,
    phone,
    is_default,
  ];

  const result = await client.query(q, values);
  return result.rows[0];
}

export async function deleteAddress(userId, addressId) {
  const q = `
    UPDATE addresses 
    SET deleted_at = NOW()
    WHERE (user_id = $1 AND id = $2)
  `;

  await pool.query(q, [userId, addressId]);
}

export async function getAllAddresses(userId) {
  const q = `
    SELECT id, street, postal_code, city, phone, full_name, is_default
    FROM addresses
    WHERE user_id = $1 AND deleted_at IS NULL
    `;

  const result = await pool.query(q, [userId]);
  return result.rows ?? [];
}

export async function getDefaultAddress(userId) {
  const q = `
  SELECT id, street, postal_code, city, phone, full_name, is_default
  FROM addresses
  WHERE user_id = $1
  AND is_default = TRUE 
  AND deleted_at IS NULL
  LIMIT 1;
  `;
  const result = await pool.query(q, [userId]);
  return result.rows[0] || null;
}

export async function setAddressAsDefault(client, userId, addressId) {
  const q = `
    UPDATE addresses 
    SET 
      is_default = true
    WHERE user_id = $1
    AND id = $2
    `;

  const values = [userId, addressId];
  await client.query(q, values);
}

export async function saveShippingInfo(client, userId, address) {
  if (address.is_default) {
    await clearDefaultAddress(client, userId);
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

export async function updateUserAddress(client, payload, addressId, userId) {
  const { full_name, street, city, postal_code, phone, is_default } = payload;
  const q = `
    UPDATE addresses 
    SET 
      full_name = $1, 
      street = $2,
      city = $3,
      postal_code = $4,
      phone = $5,
      is_default = $6
    WHERE user_id = $7
    AND id = $8
    `;
  const values = [
    full_name,
    street,
    city,
    postal_code,
    phone,
    is_default,
    userId,
    addressId,
  ];
  await client.query(q, values);
}
