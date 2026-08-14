import bcrypt from "bcrypt";
import {
  clearPasswordResetToken,
  createAccount,
  createPasswordResetToken,
  findMyProfile,
  findPasswordById,
  findUserByEmail,
  findUserById,
  findUserByPasswordResetToken,
  updateLastLogin,
  updatePassword,
  updateUserRefreshToken,
  updateUserStripeId,
} from "../services/account-service.js";
import { createStripeCustomer } from "../integrations/stripe/customer.js";
import { AUTH_ERROR } from "../constants/errors.js";
import {
  generateTokens,
  verifyPassword,
  verifyRefreshToken,
} from "../utils/auth.js";
import { sendPasswordResetEmail } from "../utils/email.js";
import { BCRYPT_SALT_ROUNDS } from "../constants/auth.js";

async function hashAndSaveRefreshToken(userId, refreshToken, client = null) {
  const hashedRefresh = await bcrypt.hash(refreshToken, BCRYPT_SALT_ROUNDS);
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

export async function changePassword(currentPassword, password, userId) {
  if (currentPassword === password) {
    throw new Error(AUTH_ERROR.SAME_PASSWORD);
  }

  const pwInDb = await findPasswordById(userId);

  if (!pwInDb) {
    throw new Error(AUTH_ERROR.USER_NOT_FOUND);
  }

  const passwordMatches = await verifyPassword(
    currentPassword,
    pwInDb.password,
  );

  if (!passwordMatches) {
    throw new Error(AUTH_ERROR.INCORRECT_PASSWORD);
  }

  await updatePassword(password, userId);
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

export async function getMyProfile(userId) {
  const profile = await findMyProfile(userId);

  if (!profile) {
    throw new Error(AUTH_ERROR.USER_NOT_FOUND);
  }

  return profile;
}

export async function login(email, password) {
  const loggedInUser = await findUserByEmail(email);

  if (!loggedInUser) {
    throw new Error(AUTH_ERROR.INVALID_CREDENTIALS);
  }

  const passwordMatches = await verifyPassword(password, loggedInUser.password);

  if (!passwordMatches) {
    throw new Error(AUTH_ERROR.INVALID_CREDENTIALS);
  }

  const { accessToken, refreshToken } = issueAuthSession(
    loggedInUser,
    loggedInUser.stripe_customer_id,
  );

  await hashAndSaveRefreshToken(loggedInUser.id, refreshToken);

  try {
    await updateLastLogin(loggedInUser.id);
  } catch (err) {
    console.error(
      `Failed to update last_login for user ${loggedInUser.id}:`,
      err,
    );
  } // 부가 정보라 실패해도 로그인 응답을 막지 않음

  return { accessToken, refreshToken };
}

export async function logout(refreshToken) {
  if (!refreshToken) return;

  try {
    const decoded = await verifyRefreshToken(refreshToken);
    const dbUser = await findUserById(decoded.id);

    if (dbUser?.current_refresh_token) {
      // DB에 저장된 refreshToken과 일치 여부 확인
      const isMatch = await bcrypt.compare(
        refreshToken,
        dbUser.current_refresh_token,
      );

      if (isMatch) {
        try {
          await updateUserRefreshToken(decoded.id, null);
        } catch (err) {
          console.error(
            `Failed to invalidate refresh token for user ${decoded.id}`,
            err,
          );
        }
      }
    }
  } catch (err) {
    console.error("Refresh token verification failed during logout", err);
  }
}

export async function resetPassword({ client, hashedPwResetToken, password }) {
  const user = await findUserByPasswordResetToken(hashedPwResetToken);

  if (!user) throw new Error(AUTH_ERROR.INVALID_RESET_TOKEN);

  const { accessToken, refreshToken } = issueAuthSession(user);
  const hashedRefresh = await bcrypt.hash(refreshToken, BCRYPT_SALT_ROUNDS);

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

  let createdUser;

  try {
    await client.query("BEGIN");
    createdUser = await createAccount(name, email, password, client);
    await client.query("COMMIT");
  } catch (err) {
    await client.query("ROLLBACK").catch(() => {});

    if (err.code === "23505") {
      throw new Error(AUTH_ERROR.EMAIL_ALREADY_IN_USE, { cause: err });
    }
    throw err;
  }

  // 부가 작업
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

export async function refreshAccessToken(currentRefreshToken) {
  if (!currentRefreshToken) {
    throw new Error(AUTH_ERROR.MISSING_REFRESH_TOKEN);
  }

  // 토큰 검증
  const decodedToken = await verifyRefreshToken(currentRefreshToken);

  const dbUser = await findUserById(decodedToken.id);
  if (!dbUser) throw new Error(AUTH_ERROR.USER_NOT_FOUND);

  if (!dbUser.current_refresh_token) {
    throw new Error(AUTH_ERROR.SESSION_REVOKED);
  }

  // DB에 저장된 refreshToken과 일치 여부 확인
  const isMatch = await bcrypt.compare(
    currentRefreshToken,
    dbUser.current_refresh_token,
  );
  if (!isMatch) {
    throw new Error(AUTH_ERROR.SESSION_REVOKED);
  }

  const { accessToken, refreshToken } = issueAuthSession(
    dbUser,
    dbUser.stripe_customer_id,
  );

  await hashAndSaveRefreshToken(dbUser.id, refreshToken);

  return { accessToken, refreshToken };
}

export async function requestPasswordReset(email) {
  const rawToken = await createPasswordResetToken(email);

  if (!rawToken) return;

  const resetLink = `${process.env.FRONTEND_PUBLIC_URL}/reset-password?token=${rawToken}`;

  try {
    await sendPasswordResetEmail(email, resetLink);
  } catch (err) {
    console.error(`Failed to send password reset email to ${email}:`, err);
  }
}
