import bcrypt from "bcrypt";
import {
  clearPasswordResetToken,
  createAccount,
  findUserByEmail,
  findUserByPasswordResetToken,
  updateLastLogin,
  updatePassword,
  updateUserRefreshToken,
  updateUserStripeId,
} from "../services/account-service.js";
import { createStripeCustomer } from "../integrations/stripe/customer.js";
import { AUTH_ERROR } from "../constants/errors.js";
import { generateTokens } from "../utils/auth.js";

// login, logout, refreshAccessToken, changePassword, requestPasswordReset, getCurrentUser

async function hashAndSaveRefreshToken(userId, refreshToken, client) {
  const hashedRefresh = await bcrypt.hash(refreshToken, 10);
  await updateUserRefreshToken(userId, hashedRefresh, client);
}

function issueAuthSession(user, stripeCustomerId = null) {
  const { accessToken, refreshToken } = generateTokens({
    id: user.id,
    role: user.role,
    name: user.name,
    email: user.email,
    stripe_customer_id: stripeCustomerId || user.stripe_customer_id,
  });

  return { accessToken, refreshToken };
}

export async function createStripeCustomerId(createdUser) {
  try {
    const stripeCustomer = await createStripeCustomer(createdUser);
    await updateUserStripeId(createdUser.id, stripeCustomer.id);

    return stripeCustomer.id;
  } catch (err) {
    console.error(
      `Failed to set up Stripe customer for ${createdUser.email}:`,
      err,
    );
    return null;
  }
}

export async function resetPassword({ client, hashedPwResetToken, password }) {
  const user = await findUserByPasswordResetToken(hashedPwResetToken);

  if (!user) throw new Error(AUTH_ERROR.INVALID_RESET_TOKEN);

  const { accessToken, refreshToken } = issueAuthSession(user);
  const hashedRefresh = await bcrypt.hash(refreshToken, 10);

  await client.query("BEGIN");
  await updatePassword(password, user.id, client);
  await clearPasswordResetToken(user.id, client);
  await updateUserRefreshToken(user.id, hashedRefresh, client);
  await client.query("COMMIT");

  return { accessToken, refreshToken };
}

export async function signup({ client, name, email, password }) {
  const existingUser = await findUserByEmail(email);

  if (existingUser) {
    throw new Error(AUTH_ERROR.EMAIL_ALREADY_IN_USE);
  }

  await client.query("BEGIN");
  const createdUser = await createAccount(name, email, password, client);
  await client.query("COMMIT");

  await updateLastLogin(createdUser.id, client).catch((err) => {
    console.error(
      `Failed to update last_login for user ${createdUser.id}:`,
      err,
    );
  });

  const stripeCustomerId = await createStripeCustomerId(createdUser);
  const { accessToken, refreshToken } = issueAuthSession(
    createdUser,
    stripeCustomerId,
  );

  try {
    await hashAndSaveRefreshToken(createdUser.id, refreshToken, client);
  } catch (err) {
    console.error(
      `Account ${createdUser.id} created but failed to persist refresh token:`,
      err,
    );
    return { accountCreated: true, sessionIssued: false };
  }

  return {
    accountCreated: true,
    sessionIssued: true,
    accessToken,
    refreshToken,
  };
}
