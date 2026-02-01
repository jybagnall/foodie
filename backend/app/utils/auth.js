import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import { promisify } from "util";

export async function hashPassword(password) {
  const saltRounds = 10;
  const hashedPassword = await bcrypt.hash(password, saltRounds);

  return hashedPassword;
}

export async function verifyPassword(password, hashedPassword) {
  return await bcrypt.compare(password, hashedPassword);
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
      { expiresIn: "5m" },
    ),
    refreshToken: jwt.sign(
      { ...data, tokenType: "refresh" },
      process.env.JWT_SECRET,
      { expiresIn: "14d" },
    ), // 서버가 토큰 검증을 할 때 사용함. 신뢰할 날짜인가
  };
}

export function verifyAccessToken(token) {
  return jwt.verify(token, process.env.JWT_SECRET);
}

const verifyToken = promisify(jwt.verify);

export async function verifyRefreshToken(token) {
  try {
    const user = await verifyToken(token, process.env.JWT_SECRET);

    if (user.tokenType !== "refresh") {
      throw new Error("Invalid token type");
    }

    return user;
  } catch (e) {
    console.error("Access token invalid:", e.message);
    throw new Error("Invalid access token");
  }
}

// user:
//   {
//   id: 10,
//   role: "admin",
//   tokenType: "refresh",
//   iat: 1766176085,
//   exp: 1766626485
// }
