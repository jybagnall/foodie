import pool from "../config/db.js";
import { generateHashedToken, hashToken } from "../utils/auth.js";
import { AUTH_ERROR } from "../constants/errors.js";
import { ADMIN_INVITATION_EXPIRATION_MS } from "../constants/auth.js";

export async function getAdmins() {
  const q = `
  SELECT id, name, email, created_at, last_login_at 
  FROM users
  WHERE role = 'admin'
  ORDER BY created_at DESC
  `;

  const result = await pool.query(q);
  return result.rows;
}

export async function createAdminInvitation(email) {
  const { rawToken, hashedToken, expiresAt } = await generateHashedToken(
    ADMIN_INVITATION_EXPIRATION_MS,
  );

  const q = `
    INSERT INTO admin_invites (email, token, expires_at)
    VALUES ($1, $2, $3)
    RETURNING id
  `;

  const result = await pool.query(q, [email, hashedToken, expiresAt]);

  if (!result.rows[0]) {
    throw new Error(AUTH_ERROR.INVITATION_CREATE_FAILED);
  }

  return rawToken;
}

export async function invalidateAdminInvitation(inviteId, client) {
  const q = `
    UPDATE admin_invites
    SET used = TRUE
    WHERE id = $1 AND used = FALSE
  `;
  const result = await client.query(q, [inviteId]);

  if (result.rowCount === 0) {
    throw new Error(AUTH_ERROR.INVITATION_INVALIDATE_FAILED);
  }
}

export async function verifyAdminInvitation(token, email) {
  const hashedToken = hashToken(token);

  const q = `
    SELECT * FROM admin_invites
    WHERE email = $1
    AND token = $2
    AND used = FALSE
    AND expires_at > NOW()
  `;

  const result = await pool.query(q, [email, hashedToken]);

  return result.rows[0] ?? null;
}
