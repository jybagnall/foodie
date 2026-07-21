import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import { promisify } from "util";
import crypto from "crypto";
import {
  ACCESS_TOKEN_EXPIRES_IN,
  REFRESH_TOKEN_EXPIRES_IN,
  BCRYPT_SALT_ROUNDS,
} from "../constants/auth.js";

export async function hashPassword(password) {
  const hashedPassword = await bcrypt.hash(password, BCRYPT_SALT_ROUNDS);
  return hashedPassword;
}

export async function hashRawPasswordToken(token) {
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
  if (!process.env.JWT_SECRET) {
    throw new Error("JWT_SECRET is not defined");
  }

  const data = {
    id: account.id,
    role: account.role,
    name: account.name,
    email: account.email,
    stripe_customer_id: account.stripe_customer_id || null,
  };

  return {
    accessToken: jwt.sign(
      { ...data, tokenType: "access" },
      process.env.JWT_SECRET,
      { expiresIn: ACCESS_TOKEN_EXPIRES_IN },
    ),
    refreshToken: jwt.sign(
      { ...data, tokenType: "refresh" },
      process.env.JWT_SECRET,
      { expiresIn: REFRESH_TOKEN_EXPIRES_IN },
    ), // 서버가 토큰 검증을 할 때 사용함. 신뢰할 날짜인가
  };
}

export function verifyAccessToken(token) {
  return jwt.verify(token, process.env.JWT_SECRET);
}

const verifyToken = promisify(jwt.verify);

export async function verifyRefreshToken(token) {
  const user = await verifyToken(token, process.env.JWT_SECRET);

  if (user.tokenType !== "refresh") {
    throw new Error("Invalid token type.");
  }

  return user;
}

// user:
//   {
//   id: 10,
//   role: "admin",
//   tokenType: "refresh",
//   iat: 1766176085,
//   exp: 1766626485
// }
