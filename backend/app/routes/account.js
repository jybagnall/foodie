import express from "express";
import bcrypt from "bcrypt";
import Stripe from "stripe";
import {
  getHashedPassword,
  createAccount,
  findUserByEmail,
  findUserById,
  updateUserStripeId,
  updateUserRefreshToken,
} from "../services/account-service.js";
import {
  generateTokens,
  verifyPassword,
  verifyRefreshToken,
} from "../utils/auth.js";
import { verifyUserAuth } from "../middleware/auth.middleware.js";

// 🤔 미들웨어

const router = express.Router();
const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);

router.get("/user", verifyUserAuth, async (req, res) => {
  try {
    const { id } = req.user.id;
    const existingUser = await findUserById(id);

    if (!existingUser) {
      return res.status(400).json({
        error: "We couldn’t verify your account. Please sign in again.",
      });
    }

    res.status(200).json({
      message: "User information is found.",
      user: {
        id: existingUser.id,
        name: existingUser.name,
        email: existingUser.email,
        role: existingUser.role,
        stripe_customer_id: existingUser.stripe_customer_id,
      },
    });
  } catch (err) {
    if (err) {
      res.status(500).json({
        error: "We're having trouble verifying your account right now.",
      });
    }
  }
});

router.post("/login", async (req, res) => {
  try {
    const { email, password } = req.body;
    const storedPassword = await getHashedPassword(email.trim());

    if (!storedPassword) {
      return res
        .status(401)
        .json({ error: "Please check your email or password and try again." });
    } // 유저 없음

    const passwordMatches = verifyPassword(password, storedPassword);

    if (!passwordMatches) {
      return res
        .status(401)
        .json({ error: "Incorrect email or password. Please try again." });
    }

    const loggedInUser = await findUserByEmail(email.trim());
    const { accessToken, refreshToken } = generateTokens({
      id: loggedInUser.id,
      role: loggedInUser.role,
      email: loggedInUser.email,
      stripe_customer_id: loggedInUser.stripe_customer_id,
    });

    res.cookie("refreshToken", refreshToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "Strict",
      maxAge: 14 * 24 * 60 * 60 * 1000,
    });

    res.status(200).json({
      message: "You have successfully logged in! Welcome back.",
      accessToken,
    });
  } catch (err) {
    console.error("Login error,", err.message);
    res
      .status(500)
      .json({ error: "A server error occurred. Please try again later." });
  }
});

// 쿠키 제거는 서버에서만
router.post("/logout", (req, res) => {
  res.clearCookie("refreshToken", {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "Strict",
  });

  res.status(200).json({ message: "Logged out successfully" });
});

router.post("/refresh-access-token", async (req, res) => {
  try {
    const refreshToken = req.cookies.refreshToken;
    if (!refreshToken) {
      return res.status(400).json({ error: "Missing refresh token." });
    } // ✅유저에게 보여줄 메시지이므로 바꿔야 함

    // 토큰 검증
    const decodedToken = await verifyRefreshToken(refreshToken);
    const dbUser = await findUserById(decodedToken.id);
    if (!dbUser) return res.status(401).json({ error: "User not found" });

    // DB에 저장된 refreshToken과 일치 여부 확인
    const isMatch = await bcrypt.compare(
      refreshToken,
      dbUser.current_refresh_token,
    );
    if (!isMatch) {
      return res.status(403).json({ error: "Invalid refresh token" });
    } // ✅유저에게 보여줄 메시지이므로 바꿔야 함

    // 새 토큰 생성
    const newTokens = generateTokens({
      id: dbUser.id,
      role: dbUser.role,
      email: dbUser.email,
      stripe_customer_id: dbUser.stripeCustomer.id,
    });

    // 새 refreshToken 해시 저장 (이전 토큰 무효화)
    const hashedNewRefresh = await bcrypt.hash(newTokens.refreshToken, 10);
    await updateUserRefreshToken(dbUser.id, hashedNewRefresh);

    // 새 refreshToken 쿠키 발급
    res.cookie("refreshToken", newTokens.refreshToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "Strict",
      maxAge: 14 * 24 * 60 * 60 * 1000,
    });

    res.status(200).json({
      message: "Access token refreshed successfully.",
      accessToken: newTokens.accessToken,
    });
  } catch (err) {
    console.error("Refresh token error:", err.message);
    res.status(401).json({ error: "Invalid or expired refresh token" });
  }
});

router.post("/signup", async (req, res) => {
  try {
    const { name, email, password } = req.body;

    const existingUser = await findUserByEmail(email);
    if (existingUser) {
      return res.status(400).json({ error: "Email already in use." });
    }

    const createdUser = await createAccount(name, email, password);

    const stripeCustomer = await stripe.customers.create({
      name,
      email,
      metadata: { userId: createdUser.id },
    });

    await updateUserStripeId(createdUser.id, stripeCustomer.id);

    const { accessToken, refreshToken } = generateTokens({
      id: createdUser.id,
      role: createdUser.role,
      email: createdUser.email,
      stripe_customer_id: stripeCustomer.id,
    }); // { accessToken, refreshToken}

    // refreshToken은 httpOnly 쿠키에 저장
    // 서버는 httpOnly 쿠키를 통해 refreshToken을 내려주고,
    // 클라이언트는 이를 직접 읽지 않고 withCredentials: true로만 전송.
    res.cookie("refreshToken", refreshToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "Strict",
      maxAge: 14 * 24 * 60 * 60 * 1000, // 14 DAYS
    }); // 브라우저에 언제까지 토큰을 저장할지 정의.
    // 🤔🤔 브라우저에 저장되는 거임?

    res.status(201).json({
      message: "Account created successfully",
      accessToken, // Signup 페이지에서 받아야 함
    });
  } catch (err) {
    if (err.code === "23505") {
      // PostgreSQL unique_violation
      res.status(400).json({ error: "Email already registered." });
    } else {
      res
        .status(500)
        .json({ error: "Something went wrong while creating your account." });
    }
  }
});

export default router;
