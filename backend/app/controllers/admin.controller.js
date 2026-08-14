import { AUTH_ERROR } from "../constants/errors";
import { createAccount, findUserByEmail } from "../services/account-service";
import {
  createAdminInvitation,
  invalidateAdminInvitation,
  verifyAdminInvitation,
} from "../services/admin-service";
import { generateTokens } from "../utils/auth";
import { sendAdminInvitationEmail } from "../utils/email";

export async function adminSignup({
  client,
  inviteToken,
  name,
  email,
  password,
}) {
  const invitedRecord = await verifyAdminInvitation(inviteToken, email);

  if (!invitedRecord) {
    throw new Error(AUTH_ERROR.INVALID_INVITATION);
  }

  const existingAdmin = await findUserByEmail(email);
  if (existingAdmin) {
    throw new Error(AUTH_ERROR.EMAIL_ALREADY_IN_USE);
  }

  let newAdmin;

  try {
    await client.query("BEGIN");
    newAdmin = await createAccount(name, email, password, client, "admin");
    await invalidateAdminInvitation(invitedRecord.id, client); // 토큰 무효화
    await client.query("COMMIT");
  } catch (err) {
    await client.query("ROLLBACK").catch(() => {});
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
  // 초대 토큰 생성
  const rawToken = await createAdminInvitation(email);
  const inviteLink = `${process.env.FRONTEND_PUBLIC_URL}/create-admin-account?token=${rawToken}`;
  await sendAdminInvitationEmail(email, inviteLink);
}
