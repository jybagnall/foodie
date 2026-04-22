import pool from "../config/db.js";
import { generateHashedToken, hashPassword } from "../utils/auth.js";

export async function clearPasswordResetToken(userId, client) {
  const q = `
    UPDATE users
    SET password_reset_token = NULL,
        password_reset_expires_at = NULL
    WHERE id = $1
  `;
  await client.query(q, [userId]);
  return { success: true };
}

export async function createAccount(
  name,
  email,
  password,
  client,
  role = "user",
) {
  const hashedPw = await hashPassword(password);
  const q = `
    INSERT INTO users (name, email, password, role)
    VALUES ($1, $2, $3, $4)
    RETURNING id, name, email, role
    `;

  const values = [name, email, hashedPw, role];
  const result = await client.query(q, values);
  return result.rows[0];
}

export async function createPasswordResetToken(email) {
  const { rawToken, hashedToken, expiresAt } = await generateHashedToken();

  const q = `
    UPDATE users
    SET 
      password_reset_token = $1,
      password_reset_expires_at = $2
    WHERE email = $3
    RETURNING id
  `;

  const result = await pool.query(q, [hashedToken, expiresAt, email]);
  if (result.rowCount === 0) return null; // 이메일 없음

  return rawToken;
}

export async function findMyProfile(id) {
  const q = `
  SELECT id, name, email, created_at FROM users
  WHERE id = $1 
  `;

  const result = await pool.query(q, [id]);
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

export async function updatePassword(password, userId, db = pool) {
  const hashedPw = await hashPassword(password);
  const q = `
    UPDATE users
    SET password= $1
    WHERE id = $2
    `;
  const values = [hashedPw, userId];

  await db.query(q, values);
  return { success: true };
}

export async function updateUserName(userId, name) {
  const q = `
    UPDATE users
    SET name = $1
    WHERE id = $2
    `;
  const values = [name, userId];

  await pool.query(q, values);
  return { success: true };
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
  await db.query(q, values);
  return { success: true };
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

  await db.query(q, values);
  return { success: true };
}
