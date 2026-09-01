import pool from "../config/db.js";
import { AUTH_ERROR } from "../constants/errors.js";

export async function clearPasswordResetToken(userId, client) {
  const q = `
    UPDATE users
    SET password_reset_token = NULL,
        password_reset_expires_at = NULL
    WHERE id = $1
  `;
  const result = await client.query(q, [userId]);

  if (result.rowCount === 0) {
    throw new Error(AUTH_ERROR.USER_NOT_FOUND);
  }
}

export async function createAccount({
  name,
  email,
  hashedPw,
  client,
  role = "user",
}) {
  const q = `
    INSERT INTO users (name, email, password, role)
    VALUES ($1, $2, $3, $4)
    RETURNING id, name, email, role
    `;

  const values = [name, email, hashedPw, role];
  const result = await client.query(q, values);

  if (!result.rows[0]) {
    throw new Error(AUTH_ERROR.ACCOUNT_CREATION_FAILED);
  }

  return result.rows[0];
}

export async function createPasswordResetToken({
  email,
  hashedToken,
  expiresAt,
}) {
  const q = `
    UPDATE users
    SET 
      password_reset_token = $1,
      password_reset_expires_at = $2
    WHERE email = $3
    RETURNING id
  `;

  const result = await pool.query(q, [hashedToken, expiresAt, email]);
  return result.rows[0] ?? null;
}

export async function deleteUserAccount(userId, client) {
  const q = `
    UPDATE users
    SET
      name = 'Deleted User',
      email = 'deleted-user-' || id || '@deleted.local',
      password = '',
      stripe_customer_id = NULL,
      current_refresh_token = NULL,
      password_reset_token = NULL,
      password_reset_expires_at = NULL,
      deleted_at = NOW()
    WHERE id = $1 AND deleted_at IS NULL
    RETURNING id
  `;
  const result = await client.query(q, [userId]);

  if (result.rowCount === 0) {
    throw new Error(AUTH_ERROR.USER_NOT_FOUND);
  }
}

export async function findMyProfile(id) {
  const q = `
  SELECT id, name, email, created_at FROM users
  WHERE id = $1 
  `;

  const result = await pool.query(q, [id]);
  return result.rows[0];
}

export async function findPasswordAndStripeCustomerId(userId) {
  const q = `
    SELECT password, stripe_customer_id FROM users
    WHERE id = $1
  `;
  const result = await pool.query(q, [userId]);
  return result.rows[0];
}

export async function findPasswordById(userId) {
  const q = `
  SELECT password FROM users
  WHERE id = $1 
  `;

  const result = await pool.query(q, [userId]);
  return result.rows[0];
}

export async function findUserByEmail(email) {
  const q = `
  SELECT id, name, email, role, password, stripe_customer_id 
  FROM users
  WHERE email = $1 
  `;

  const result = await pool.query(q, [email]);
  return result.rows[0];
}

export async function findUserById(id) {
  const q = `
  SELECT id, name, email, role, stripe_customer_id, current_refresh_token 
  FROM users
  WHERE id = $1 
  `;

  const result = await pool.query(q, [id]);
  return result.rows[0];
}

export async function findUserByPasswordResetToken(hashedPwResetToken) {
  const q = `
  SELECT id, name, email, role, stripe_customer_id 
  FROM users
  WHERE password_reset_token = $1        
  AND password_reset_expires_at > NOW() 
  `;
  const result = await pool.query(q, [hashedPwResetToken]);
  return result.rows[0];
}

export async function updatePassword(hashedPw, userId, db = pool) {
  const q = `
    UPDATE users
    SET password= $1
    WHERE id = $2
    `;
  const values = [hashedPw, userId];

  const result = await db.query(q, values);
  if (result.rowCount === 0) {
    throw new Error(AUTH_ERROR.PASSWORD_UPDATE_FAILED);
  }
}

export async function updateLastLogin(userId, db = pool) {
  const q = `
    UPDATE users
    SET last_login_at = NOW()
    WHERE id = $1
  `;
  const result = await db.query(q, [userId]);

  if (result.rowCount === 0) {
    throw new Error(AUTH_ERROR.LAST_LOGIN_UPDATE_FAILED);
  }
}

export async function updateRefreshTokenIfMatch(
  userId,
  oldHashedToken,
  newHashedToken,
) {
  const q = `
    UPDATE users
    SET current_refresh_token = $1
    WHERE id = $2 AND current_refresh_token = $3
    RETURNING id
    `;
  const values = [newHashedToken, userId, oldHashedToken];
  const result = await pool.query(q, values);
  return result.rowCount > 0; // 거짓이면 다른 요청이 이미 업데이트함
}

export async function updateUserName(userId, name) {
  const q = `
    UPDATE users
    SET name = $1
    WHERE id = $2
    `;
  const values = [name, userId];

  const result = await pool.query(q, values);

  if (result.rowCount === 0) {
    throw new Error(AUTH_ERROR.USER_NAME_UPDATE_FAILED);
  }
}

export async function updateUserRefreshToken(
  userId,
  hashedNewRefresh,
  db = pool,
) {
  const q = `
    UPDATE users
    SET current_refresh_token = $1
    WHERE id = $2
    `;
  const values = [hashedNewRefresh, userId];
  const result = await db.query(q, values);

  if (result.rowCount === 0) {
    throw new Error(AUTH_ERROR.REFRESH_TOKEN_UPDATE_FAILED);
  }
}

export async function updateUserStripeId(
  userId,
  newStripeCustomerId,
  db = pool,
) {
  const q = `
    UPDATE users
    SET stripe_customer_id = $1
    WHERE id = $2
    `;
  const values = [newStripeCustomerId, userId];

  const result = await db.query(q, values);
  if (result.rowCount === 0) {
    throw new Error(AUTH_ERROR.STRIPE_ID_UPDATE_FAILED);
  }
}
