import express from "express";
import {
  getHashedPassword,
  createAccount,
  findUserByEmail,
  findUserById,
} from "../services/account-service.js";
import {
  generateTokens,
  hashPassword,
  verifyPassword,
  verifyRefreshToken,
} from "../utils/auth.js";

// 🤔 미들웨어
import { veryfyUserAuth } from "../middleware/auth.middleware.js";

const router = express.Router();

router.get("/user/:id", async (req, res) => {
  try {
    const { id } = req.params;
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
    const tokens = generateTokens({
      id: loggedInUser.id,
      role: loggedInUser.role,
    });

    res.status(200).json({
      message: "You have successfully logged in! Welcome back.",
      user: {
        id: loggedInUser.id,
        name: loggedInUser.name,
        email: loggedInUser.email,
        role: loggedInUser.role,
      },
      tokenPair: tokens,
    });
  } catch (err) {
    console.error("Login error,", err.message);
    res
      .status(500)
      .json({ error: "A server error occurred. Please try again later." });
  }
});

router.post("/refresh-tokens", async (req, res) => {
  try {
    const { refreshToken } = req.body;
    if (!refreshToken) {
      return res
        .status(400)
        .json({ error: "Missing refresh token in req.body." });
    }

    const decodedToken = await verifyRefreshToken(refreshToken);
    const dbUser = await findUserById(decodedToken.id);

    if (dbUser) {
      const newTokens = generateTokens({ id: dbUser.id, role: dbUser.role });

      res.status(200).json({
        message: "Access token refreshed successfully.",
        tokenPair: newTokens,
      });
    }
  } catch (err) {
    console.error("Refresh token error:", err.message);

    if (err.message.includes("Invalid token type")) {
      return res.status(403).json({ error: "Invalid token type" });
    }
    if (err.name === "TokenExpiredError") {
      return res.status(401).json({ error: "Refresh token expired" });
    }

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
    const tokens = generateTokens({
      id: createdUser.id,
      role: createdUser.role,
    }); // { accessToken, refreshToken}

    res.status(201).json({
      message: "Account created successfully",
      user: {
        id: createdUser.id,
        name: createdUser.name,
        email: createdUser.email,
        role: createdUser.role,
      },
      tokenPair: tokens,
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
