import pool from "../config/db.js";
import { AUTH_ERROR } from "../constants/errors.js";
import { createAccount, findUserByEmail } from "../services/account-service.js";
import {
  createAdminInvitation,
  invalidateAdminInvitation,
  verifyAdminInvitation,
} from "../services/admin-service.js";
import { generateTokens, hashPassword } from "../utils/auth.js";
import { withTransaction } from "../utils/db.js";
import { sendAdminInvitationEmail } from "../utils/email.js";

export async function adminSignup({ inviteToken, name, email, password }) {
  const invitedRecord = await verifyAdminInvitation(inviteToken, email);

  if (!invitedRecord) {
    throw new Error(AUTH_ERROR.INVALID_INVITATION);
  }

  const existingAdmin = await findUserByEmail(email);
  if (existingAdmin) {
    throw new Error(AUTH_ERROR.EMAIL_ALREADY_IN_USE);
  }

  const hashedPw = await hashPassword(password);

  let newAdmin;

  try {
    newAdmin = await withTransaction(pool, async (client) => {
      const admin = await createAccount({
        name,
        email,
        hashedPw,
        client,
        role: "admin",
      });
      await invalidateAdminInvitation(invitedRecord.id, client); // 토큰 무효화

      return admin;
    });
  } catch (err) {
    if (err.code === "23505") {
      throw new Error(AUTH_ERROR.EMAIL_ALREADY_IN_USE, { cause: err });
    }
    throw err;
  }

  const { accessToken } = generateTokens({
    id: newAdmin.id,
    name: newAdmin.name,
    email: newAdmin.email,
    role: newAdmin.role,
  });

  return { accessToken };
}

export async function inviteAdmin(email) {
  const existingAdmin = await findUserByEmail(email);
  if (existingAdmin?.role === "admin") {
    throw new Error(AUTH_ERROR.EMAIL_ALREADY_IN_USE);
  }

  // 초대 토큰 생성
  const rawToken = await createAdminInvitation(email);
  const inviteLink = `${process.env.FRONTEND_PUBLIC_URL}/create-admin-account?token=${rawToken}`;
  await sendAdminInvitationEmail(email, inviteLink);
}
