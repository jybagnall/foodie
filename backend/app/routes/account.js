import express from "express";
import bcrypt from "bcrypt";
import Stripe from "stripe";
import jwt from "jsonwebtoken";

import {
  createAccount,
  findUserByEmail,
  findUserById,
  updateUserStripeId,
  updateUserRefreshToken,
  findMyProfile,
  updateUserName,
  findPasswordById,
  updatePassword,
} from "../services/account-service.js";
import {
  generateTokens,
  hashPassword,
  verifyPassword,
  verifyRefreshToken,
} from "../utils/auth.js";
import { verifyUserAuth } from "../middleware/auth.middleware.js";
import { validateBody } from "../middleware/validateBody.js";
import { setRefreshTokenCookie } from "../utils/cookie.js";
import pool from "../config/db.js";

const router = express.Router();
const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);

router.get("/my-profile", verifyUserAuth, async (req, res) => {
  try {
    const profile = await findMyProfile(req.user.id);

    if (!profile) {
      return res.status(400).json({
        error: "We couldn’t verify your account. Please sign in again.",
      });
    }

    res.status(200).json(profile);
  } catch (err) {
    res.status(500).json({
      error: "We're having trouble verifying your account right now.",
    });
  }
});

router.get("/user", verifyUserAuth, async (req, res) => {
  try {
    const existingUser = await findUserById(req.user.id);

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
    res.status(500).json({
      error: "We're having trouble verifying your account right now.",
    });
  }
});

router.post("/login", validateBody("email", "password"), async (req, res) => {
  try {
    const { email, password } = req.body;
    const loggedInUser = await findUserByEmail(email);

    if (!loggedInUser) {
      return res
        .status(401)
        .json({ error: "Please check your email or password and try again." });
    }

    const passwordMatches = await verifyPassword(
      password,
      loggedInUser.password,
    );

    if (!passwordMatches) {
      return res
        .status(401)
        .json({ error: "Incorrect email or password. Please try again." });
    }

    const { accessToken, refreshToken } = generateTokens({
      id: loggedInUser.id,
      role: loggedInUser.role,
      name: loggedInUser.name,
      email: loggedInUser.email,
      stripe_customer_id: loggedInUser.stripe_customer_id,
    });

    const hashedRefresh = await bcrypt.hash(refreshToken, 10);
    await updateUserRefreshToken(loggedInUser.id, hashedRefresh);
    setRefreshTokenCookie(res, refreshToken);

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
router.post("/logout", async (req, res) => {
  const refreshToken = req.cookies.refreshToken;

  if (refreshToken) {
    try {
      const decoded = jwt.decode(refreshToken);
      if (decoded?.id) {
        await updateUserRefreshToken(decoded.id, null);
      }
    } catch (err) {
      console.error("Token decode failed during logout", err);
    }
  }

  // jwt.decode가 실패해도, 브라우저 쿠키 저장소에서 refreshToken 제거
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
      return res.status(400).json({
        error: "Your login session has expired. Please log in again.",
      });
    }

    // 토큰 검증
    const decodedToken = await verifyRefreshToken(refreshToken);
    const dbUser = await findUserById(decodedToken.id);
    if (!dbUser)
      return res.status(401).json({
        error: "We couldn’t verify your account. Please log in again.",
      });

    // DB에 저장된 refreshToken과 일치 여부 확인
    const isMatch = await bcrypt.compare(
      refreshToken,
      dbUser.current_refresh_token,
    );
    if (!isMatch) {
      return res.status(403).json({
        error:
          "For your security, you’ve been logged out. Please sign in again.",
      });
    }

    // 새 토큰 생성
    const newTokens = generateTokens({
      id: dbUser.id,
      role: dbUser.role,
      name: dbUser.name,
      email: dbUser.email,
      stripe_customer_id: dbUser.stripe_customer_id ?? null,
    });

    // 새 refreshToken 해시 DB 저장 (이전 토큰 무효화)
    const hashedNewRefresh = await bcrypt.hash(newTokens.refreshToken, 10);
    await updateUserRefreshToken(dbUser.id, hashedNewRefresh);

    // 브라우저 쿠키 저장소에 새 refreshToken 저장
    setRefreshTokenCookie(res, newTokens.refreshToken);

    res.status(200).json({
      message: "Access token refreshed successfully.",
      accessToken: newTokens.accessToken,
    });
  } catch (err) {
    if (err instanceof RefreshTokenExpiredError) {
      console.error("Refresh token expired:", err.message);
    } else {
      console.error("Unexpected refresh error:", err);
    }
    res.status(401).json({
      error: "For your security, you’ve been logged out. Please sign in again.",
    });
  }
});

router.post(
  "/signup",
  validateBody("name", "email", "password"),
  async (req, res) => {
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
        name: createdUser.name,
        email: createdUser.email,
        stripe_customer_id: stripeCustomer.id,
      });

      const hashedRefresh = await bcrypt.hash(refreshToken, 10);
      await updateUserRefreshToken(createdUser.id, hashedRefresh);

      // ❗refreshToken을 브라우저 쿠키에 저장 (브라우저가 처리함)
      setRefreshTokenCookie(res, refreshToken);

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
  },
);

router.patch(
  "/update-name",
  verifyUserAuth,
  validateBody("name"),
  async (req, res) => {
    try {
      const { name } = req.body;
      await updateUserName(req.user.id, name);
      res.status(200).json({ success: true });
    } catch (err) {
      console.error("DB update error,", err.message);
      res
        .status(500)
        .json({ error: "Something went wrong while uploading the name." });
    }
  },
);

router.patch(
  "/update-password",
  verifyUserAuth,
  validateBody("password"),
  async (req, res) => {
    try {
      const { currentPassword, password } = req.body;

      if (currentPassword === password) {
        return res.status(400).json({
          error: "New password must be different from the current password.",
        });
      }

      const pwInDb = await findPasswordById(req.user.id);

      if (!pwInDb) {
        return res.status(404).json({
          error: "User information is not available",
        });
      }

      const passwordMatches = await verifyPassword(
        currentPassword,
        pwInDb.password,
      );

      if (!passwordMatches) {
        return res.status(401).json({ error: "Current password is incorrect" });
      }

      const hashedPw = await hashPassword(password);
      await updatePassword(hashedPw, req.user.id);
      res.status(200).json({ success: true });
    } catch (err) {
      console.error("DB update error,", err.message);
      res
        .status(500)
        .json({ error: "Something went wrong while uploading the password." });
    }
  },
);

export default router;
