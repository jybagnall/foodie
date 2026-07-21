import express from "express";
import bcrypt from "bcrypt";

import {
  findUserByEmail,
  findUserById,
  updateUserRefreshToken,
  findMyProfile,
  updateUserName,
  findPasswordById,
  updatePassword,
  createPasswordResetToken,
  findUserByPasswordResetToken,
  clearPasswordResetToken,
  updateLastLogin,
  createAccount,
} from "../services/account-service.js";
import {
  generateTokens,
  hashRawPasswordToken,
  verifyPassword,
  verifyRefreshToken,
} from "../utils/auth.js";
import { verifyUserAuth } from "../middleware/auth.middleware.js";
import { validateBody } from "../middleware/validateBody.js";
import { setRefreshTokenCookie } from "../utils/cookie.js";
import { sendPasswordResetEmail } from "../utils/email.js";
import pool from "../config/db.js";
import { createStripeCustomerId } from "../controllers/account.controller.js";

const router = express.Router();

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
    console.error("User data fetching error,", err);
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
    console.error("User data fetching error,", err);
    res.status(500).json({
      error: "We're having trouble verifying your account right now.",
    });
  }
});

router.post("/forgot-password", validateBody("email"), async (req, res) => {
  try {
    const { email } = req.body;
    const rawToken = await createPasswordResetToken(email);

    if (rawToken) {
      const resetLink = `${process.env.FRONTEND_PUBLIC_URL}/reset-password?token=${rawToken}`;
      await sendPasswordResetEmail(email, resetLink);
    }

    res.status(200).json({ message: "A reset link has been sent." });
  } catch (err) {
    console.error("Password reset error,", err);
    res.status(500).json({ error: "Something went wrong. Please try again." });
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

    try {
      await updateLastLogin(loggedInUser.id);
    } catch (err) {
      console.error(
        `Failed to update last_login for user ${loggedInUser.id}:`,
        err,
      );
    } // 부가 정보라 실패해도 로그인 응답을 막지 않음

    res.status(200).json({
      message: "You have successfully logged in! Welcome back.",
      accessToken,
    });
  } catch (err) {
    console.error("Login error,", err);
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

  //  토큰 검증 결과와 관계없이 브라우저 쿠키 저장소에서 refreshToken 제거
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

    if (!dbUser.current_refresh_token) {
      return res.status(403).json({
        error:
          "For your security, you've been logged out. Please sign in again.",
      });
    }

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
    if (err.name === "TokenExpiredError") {
      console.warn("Refresh token expired (normal):", err.message);
    } else if (err.name === "JsonWebTokenError") {
      console.warn("Invalid refresh token");
    } else {
      console.error("Unexpected refresh error:", err);
    }
    res.status(401).json({
      error: "For your security, you’ve been logged out. Please sign in again.",
    });
  }
});

router.post("/reset-password", validateBody("password"), async (req, res) => {
  const client = await pool.connect();
  try {
    const { resetToken, password } = req.body;
    const hashedPwResetToken = await hashRawPasswordToken(resetToken);
    const user = await findUserByPasswordResetToken(hashedPwResetToken);

    if (!user)
      return res.status(400).json({ error: "Invalid or expired token." });

    await client.query("BEGIN");
    await updatePassword(password, user.id, client);
    await clearPasswordResetToken(user.id, client);

    const { accessToken, refreshToken } = generateTokens({
      id: user.id,
      role: user.role,
      name: user.name,
      email: user.email,
      stripe_customer_id: user.stripe_customer_id,
    });

    const hashedRefresh = await bcrypt.hash(refreshToken, 10);
    await updateUserRefreshToken(user.id, hashedRefresh, client);
    await client.query("COMMIT");

    // ❗refreshToken을 브라우저 쿠키에 저장 (브라우저가 처리함)
    setRefreshTokenCookie(res, refreshToken);

    res.status(200).json({
      message: "Password changed successfully",
      accessToken,
    });
  } catch (err) {
    console.error("Password update error,", err);
    await client.query("ROLLBACK").catch(() => {});
    res
      .status(500)
      .json({ error: "Something went wrong while updating the password." });
  } finally {
    client.release();
  }
});

router.post(
  "/signup",
  validateBody("name", "email", "password"),
  async (req, res) => {
    const client = await pool.connect();
    try {
      const { name, email, password } = req.body;
      const existingUser = await findUserByEmail(email);
      if (existingUser) {
        return res.status(400).json({ error: "Email already in use." });
      }

      await client.query("BEGIN");
      const createdUser = await createAccount(name, email, password, client);
      await updateLastLogin(createdUser.id, client).catch((err) => {
        console.error(
          `Failed to update last_login for user ${createdUser.id}:`,
          err,
        );
      });
      await client.query("COMMIT");

      const stripeCustomerId = await createStripeCustomerId(
        createdUser,
        name,
        email,
      );

      const { accessToken, refreshToken } = generateTokens({
        id: createdUser.id,
        role: createdUser.role,
        name: createdUser.name,
        email: createdUser.email,
        stripe_customer_id: stripeCustomerId,
      });

      try {
        const hashedRefresh = await bcrypt.hash(refreshToken, 10);
        await updateUserRefreshToken(createdUser.id, hashedRefresh, client);
        setRefreshTokenCookie(res, refreshToken); // refreshToken을 브라우저 쿠키에 저장
      } catch (refreshErr) {
        // 계정은 이미 만들어졌음, 가입 실패가 아니라 가입은 됐는데 세션 발급 실패
        console.error(
          `Account ${createdUser.id} created but failed to persist refresh token:`,
          refreshErr,
        );
        return res.status(201).json({
          message: "Account created, but please log in to continue.",
          accountCreated: true,
        });
      }

      res.status(201).json({
        message: "Account created successfully",
        accessToken, // Signup 페이지에서 받음
      });
    } catch (err) {
      await client.query("ROLLBACK");
      console.error("user registration error,", err);
      if (err.code === "23505") {
        res.status(400).json({ error: "Email already registered." });
      } else {
        res
          .status(500)
          .json({ error: "Something went wrong while creating your account." });
      }
    } finally {
      client.release();
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
      console.error("DB update error,", err);
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

      await updatePassword(password, req.user.id);
      res.status(200).json({ success: true });
    } catch (err) {
      console.error("DB update error,", err);
      res
        .status(500)
        .json({ error: "Something went wrong while uploading the password." });
    }
  },
);

export default router;
