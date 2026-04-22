import bcrypt from "bcrypt";
import pool from "../config/db.js";
import { generateHashedToken } from "../utils/auth.js";

export async function verifyAdminInvitation(token, email) {
  const q = `
    SELECT * FROM admin_invites
    WHERE email = $1
    AND used = FALSE
    AND expires_at > NOW()
  `;

  const result = await pool.query(q, [email]);
  const inviteRecord = result.rows[0];

  if (!inviteRecord) {
    console.error("Invalid or expired invite token");
    return null;
  }

  const isMatching = await bcrypt.compare(token, inviteRecord.token);
  if (!isMatching) return null;

  return inviteRecord;
}

export async function createAdminInvitation(email) {
  const ONE_DAY_MS = 24 * 60 * 60 * 1000;
  const { rawToken, hashedToken, expiresAt } =
    await generateHashedToken(ONE_DAY_MS);

  const q = `
    INSERT INTO admin_invites (email, token, expires_at)
    VALUES ($1, $2, $3)
    RETURNING id
  `;

  await pool.query(q, [email, hashedToken, expiresAt]);

  return rawToken;
}

export async function invalidateAdminInvitation(inviteToken, client) {
  const q = `
    UPDATE admin_invites
    SET used = TRUE
    WHERE token = $1
  `;
  await client.query(q, [inviteToken]);
}
