import express from "express";
import { updateUserName } from "../services/account-service.js";
import { verifyUserAuth } from "../middleware/auth.middleware.js";
import { validateBody } from "../middleware/validateBody.js";
import { setRefreshTokenCookie } from "../utils/cookie.js";
import {
  changePassword,
  getMyProfile,
  login,
  logout,
  refreshAccessToken,
  requestPasswordReset,
  resetPassword,
  signup,
} from "../controllers/account.controller.js";
import { AUTH_ERROR, AUTH_ERROR_STATUS } from "../constants/errors.js";

const router = express.Router();

router.get("/my-profile", verifyUserAuth, async (req, res) => {
  try {
    const profile = await getMyProfile(req.user.id);
    res.status(200).json(profile);
  } catch (err) {
    console.error("User data fetching error,", err);
    const status = AUTH_ERROR_STATUS[err.message] ?? 500;
    return res.status(status).json({
      error: "We couldn't verify your account. Please sign in again.",
    });
  }
});

router.post(
  "/forgot-password",
  validateBody("email"),
  async (req, res, next) => {
    try {
      const { email } = req.body;
      await requestPasswordReset(email);
      res.status(200).json({ message: "A reset link has been sent." });
    } catch (err) {
      return next(err);
    }
  },
);

router.post("/login", validateBody("email", "password"), async (req, res) => {
  try {
    const { email, password } = req.body;
    const { accessToken, refreshToken } = await login(email, password);
    setRefreshTokenCookie(res, refreshToken);

    res.status(200).json({
      message: "You have successfully logged in! Welcome back.",
      accessToken,
    });
  } catch (err) {
    const status = AUTH_ERROR_STATUS[err.message] ?? 500;
    const message =
      err.message === AUTH_ERROR.INVALID_CREDENTIALS
        ? "Incorrect email or password. Please try again."
        : "Something went wrong. Please try again.";
    return res.status(status).json({
      error: message,
    });
  }
});

// 쿠키 제거는 서버에서만
router.post("/logout", async (req, res) => {
  const refreshToken = req.cookies.refreshToken;
  await logout(refreshToken);

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
    const { accessToken, refreshToken: newRefreshToken } =
      await refreshAccessToken(refreshToken);

    // 브라우저 쿠키 저장소에 새 refreshToken 저장
    setRefreshTokenCookie(res, newRefreshToken);

    res.status(200).json({
      message: "Access token refreshed successfully.",
      accessToken: accessToken,
    });
  } catch (err) {
    if (err.message === AUTH_ERROR.SESSION_EXPIRED) {
      console.warn(
        "Refresh token expired (normal):",
        err.cause?.message ?? err.message,
      );
    } else if (err.message === AUTH_ERROR.INVALID_REFRESH_TOKEN) {
      console.warn(
        "Invalid/tampered refresh token:",
        err.cause?.message ?? err.message,
      );
    } else if (err.message === AUTH_ERROR.SESSION_REVOKED) {
      console.warn("Invalid refresh token");
    } else {
      console.error("Unexpected refresh error:", err);
    }

    const status = AUTH_ERROR_STATUS[err.message] ?? 401;
    return res.status(status).json({
      error: "For your security, you've been logged out. Please sign in again.",
    });
  }
});

router.post(
  "/reset-password",
  validateBody("password", "resetToken"),
  async (req, res, next) => {
    try {
      const { resetToken, password } = req.body;
      const { accessToken, refreshToken } = await resetPassword({
        resetToken,
        password,
      });

      // ❗refreshToken을 브라우저 쿠키에 저장 (브라우저가 처리함)
      setRefreshTokenCookie(res, refreshToken);
      res.status(200).json({
        message: "Password changed successfully",
        accessToken,
      });
    } catch (err) {
      console.error("Password update error,", err);
      return next(err);
    }
  },
);

router.post(
  "/signup",
  validateBody("name", "email", "password"),
  async (req, res) => {
    try {
      const { name, email, password } = req.body;
      const { accessToken, refreshToken, sessionIssued } = await signup({
        name,
        email,
        password,
      });

      if (!sessionIssued) {
        return res.status(201).json({
          message: "Account created, but please log in to continue.",
          accountCreated: true,
        });
      }

      setRefreshTokenCookie(res, refreshToken); // refreshToken을 브라우저 쿠키에 저장

      res.status(201).json({
        message: "Account created successfully",
        accessToken, // Signup 페이지에서 받음
      });
    } catch (err) {
      console.error("user registration error,", err);
      const status = AUTH_ERROR_STATUS[err.message] ?? 500;

      return res.status(status).json({
        error: "Something went wrong during signup. Please try again.",
      });
    }
  },
);

router.patch(
  "/update-name",
  verifyUserAuth,
  validateBody("name"),
  async (req, res, next) => {
    try {
      const { name } = req.body;
      await updateUserName(req.user.id, name);
      res.status(200).json({ success: true });
    } catch (err) {
      return next(err);
    }
  },
);

router.patch(
  "/update-password",
  verifyUserAuth,
  validateBody("currentPassword", "password"),
  async (req, res) => {
    try {
      const { currentPassword, password } = req.body;
      await changePassword(currentPassword, password, req.user.id);
      res.status(200).json({ success: true });
    } catch (err) {
      const status = AUTH_ERROR_STATUS[err.message] ?? 500;
      return res.status(status).json({
        error: "Something went wrong. Please try again.",
      });
    }
  },
);

export default router;
