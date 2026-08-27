import pool from "../config/db.js";
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
  updateRefreshTokenIfMatch,
  updateUserRefreshToken,
  updateUserStripeId,
} from "../services/account-service.js";
import { createStripeCustomer } from "../integrations/stripe/customer.js";
import { AUTH_ERROR } from "../constants/errors.js";
import {
  generateHashedToken,
  generateTokens,
  hashPassword,
  hashToken,
  verifyPassword,
  verifyRefreshToken,
} from "../utils/auth.js";
import { sendPasswordResetEmail } from "../utils/email.js";
import { withTransaction } from "../utils/db.js";

async function hashAndSaveRefreshToken(userId, refreshToken, client) {
  const hashedRefresh = hashToken(refreshToken);
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

  const hashedPw = await hashPassword(password);
  await updatePassword(hashedPw, userId);
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
      const isMatch = hashToken(refreshToken) === dbUser.current_refresh_token;

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

export async function resetPassword({ resetToken, password }) {
  const hashedPwResetToken = hashToken(resetToken);
  const user = await findUserByPasswordResetToken(hashedPwResetToken);

  if (!user) throw new Error(AUTH_ERROR.INVALID_RESET_TOKEN);

  const { accessToken, refreshToken } = issueAuthSession(user);
  const hashedRefresh = hashToken(refreshToken);
  const hashedPw = await hashPassword(password);

  await withTransaction(pool, async (client) => {
    await updatePassword(hashedPw, user.id, client);
    await clearPasswordResetToken(user.id, client);
    await updateUserRefreshToken(user.id, hashedRefresh, client);
  });

  return { accessToken, refreshToken };
}

export async function signup({ name, email, password }) {
  const existingUser = await findUserByEmail(email);

  if (existingUser) {
    throw new Error(AUTH_ERROR.EMAIL_ALREADY_IN_USE);
  }

  const hashedPw = await hashPassword(password);

  let createdUser;

  try {
    createdUser = await withTransaction(pool, async (client) => {
      return await createAccount({ name, email, hashedPw, client });
    });
  } catch (err) {
    if (err.code === "23505") {
      throw new Error(AUTH_ERROR.EMAIL_ALREADY_IN_USE, { cause: err });
    }
    throw err;
  }

  // 부가 작업
  await updateLastLogin(createdUser.id).catch((err) => {
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
    await hashAndSaveRefreshToken(createdUser.id, refreshToken);
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
  const hashedOldToken = hashToken(currentRefreshToken);
  if (hashedOldToken !== dbUser.current_refresh_token) {
    throw new Error(AUTH_ERROR.SESSION_REVOKED);
  }

  const { accessToken, refreshToken } = issueAuthSession(
    dbUser,
    dbUser.stripe_customer_id,
  );

  const hashedNewToken = hashToken(refreshToken);

  const didUpdate = await updateRefreshTokenIfMatch(
    dbUser.id,
    hashedOldToken,
    hashedNewToken,
  );

  if (!didUpdate) {
    // 경쟁에서 진 요청 — 다른 요청이 먼저 회전시킴
    throw new Error(AUTH_ERROR.SESSION_REVOKED);
  }

  return { accessToken, refreshToken };
}

export async function requestPasswordReset(email) {
  const { rawToken, hashedToken, expiresAt } = await generateHashedToken();
  const updatedPwResetResult = await createPasswordResetToken({
    email,
    hashedToken,
    expiresAt,
  });

  if (!updatedPwResetResult) return; // 없는 이메일, 메일 발송 안함

  const resetLink = `${process.env.FRONTEND_PUBLIC_URL}/reset-password?token=${rawToken}`;

  try {
    await sendPasswordResetEmail(email, resetLink);
  } catch (err) {
    console.error(`Failed to send password reset email to ${email}:`, err);
  }
}
