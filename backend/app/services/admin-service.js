import bcrypt from "bcrypt";
import crypto from "crypto";
import pool from "../config/db.js";

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

//🤔
export async function createAdminInvitation(email) {
  const rawToken = crypto.randomBytes(32).toString("hex"); // 사용자에게 보내는 원본
  const hashedToken = await bcrypt.hash(rawToken, 10); // DB에 저장할 버전
  const expiresAt = new Date(Date.now() + 24 * 60 * 60 * 1000); // 1일

  const q = `
    INSERT INTO admin_invites (email, token, expires_at)
    VALUES ($1, $2, $3)
    RETURNING id
  `;

  await pool.query(q, [email, hashedToken, expiresAt]);

  return rawToken;
}

export async function invalidateAdminInvitation(inviteToken) {
  const q = `
    UPDATE admin_invites
    SET used = TRUE
    WHERE token = $1
  `;
  await pool.query(q, [inviteToken]);
}
