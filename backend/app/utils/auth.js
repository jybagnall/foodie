import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import { promisify } from "util";
import crypto from "crypto";
import {
  ACCESS_TOKEN_EXPIRES_IN,
  REFRESH_TOKEN_EXPIRES_IN,
  BCRYPT_SALT_ROUNDS,
} from "../constants/auth.js";
import { AUTH_ERROR } from "../constants/errors.js";

function validateAccessTokenPayload(decoded) {
  if (
    typeof decoded !== "object" ||
    decoded === null ||
    !decoded.id ||
    !decoded.role ||
    !decoded.email ||
    decoded.tokenType !== "access"
  ) {
    throw new Error(AUTH_ERROR.INVALID_ACCESS_TOKEN);
  }
}

export async function hashPassword(password) {
  const hashedPassword = await bcrypt.hash(password, BCRYPT_SALT_ROUNDS);
  return hashedPassword;
}

export function hashToken(token) {
  const hashedToken = crypto.createHash("sha256").update(token).digest("hex");
  return hashedToken;
}

export async function verifyPassword(password, hashedPassword) {
  return await bcrypt.compare(password, hashedPassword);
}

// 기본 10분
export async function generateHashedToken(expiresInMs = 10 * 60 * 1000) {
  const rawToken = crypto.randomBytes(32).toString("hex"); // 사용자에게 보내는 원본
  const hashedToken = crypto
    .createHash("sha256")
    .update(rawToken)
    .digest("hex"); // DB에 저장할 버전
  const expiresAt = new Date(Date.now() + expiresInMs);

  return { rawToken, hashedToken, expiresAt };
}

export function generateTokens(account) {
  const accessPayload = {
    id: account.id,
    role: account.role,
    name: account.name,
    email: account.email,
    stripe_customer_id: account.stripe_customer_id ?? null,
    tokenType: "access",
  };

  const refreshPayload = {
    id: account.id,
    tokenType: "refresh",
  };

  return {
    accessToken: jwt.sign(
      { ...accessPayload },
      process.env.JWT_ACCESS_TOKEN_SECRET,
      {
        expiresIn: ACCESS_TOKEN_EXPIRES_IN,
        algorithm: "HS256",
        issuer: "foodie-api",
        audience: "foodie-client",
      },
    ),
    refreshToken: jwt.sign(
      { ...refreshPayload },
      process.env.JWT_REFRESH_TOKEN_SECRET,
      {
        expiresIn: REFRESH_TOKEN_EXPIRES_IN,
        algorithm: "HS256",
        issuer: "foodie-api",
        audience: "foodie-client",
      },
    ), // 서버가 토큰 검증을 할 때 사용함. 신뢰할 날짜인가
  };
}

export function verifyAccessToken(authHeader) {
  // Bearer + 공백 + 토큰이라는 형태
  const match = authHeader?.match(/^Bearer\s+(\S+)$/);

  if (!match) {
    throw new Error(AUTH_ERROR.INVALID_ACCESS_TOKEN);
  }

  const token = match[1];

  let decoded;

  try {
    decoded = jwt.verify(token, process.env.JWT_ACCESS_TOKEN_SECRET, {
      algorithms: ["HS256"],
      issuer: "foodie-api",
      audience: "foodie-client",
    });
  } catch (err) {
    if (err.name === "TokenExpiredError") {
      throw new Error(AUTH_ERROR.SESSION_EXPIRED, {
        cause: err,
      });
    }

    throw new Error(AUTH_ERROR.INVALID_ACCESS_TOKEN, {
      cause: err,
    });
  }

  validateAccessTokenPayload(decoded);

  return decoded;
}

const verifyToken = promisify(jwt.verify);

export async function verifyRefreshToken(token) {
  let decoded;

  try {
    decoded = await verifyToken(token, process.env.JWT_REFRESH_TOKEN_SECRET, {
      algorithms: ["HS256"],
      issuer: "foodie-api",
      audience: "foodie-client",
    });
  } catch (err) {
    if (err.name === "TokenExpiredError") {
      throw new Error(AUTH_ERROR.SESSION_EXPIRED, { cause: err });
    }

    throw new Error(AUTH_ERROR.INVALID_REFRESH_TOKEN, { cause: err });
    // JsonWebTokenError (서명 불일치, malformed 등) — 조작/무효 토큰
  }

  if (
    typeof decoded !== "object" ||
    decoded === null ||
    !decoded.id ||
    decoded.tokenType !== "refresh"
  ) {
    throw new Error(AUTH_ERROR.INVALID_REFRESH_TOKEN);
  }

  return decoded;
}

// user:
//   {
//   id: 10,
//   role: "admin",
//   tokenType: "refresh",
//   iat: 1766176085,
//   exp: 1766626485
// }
