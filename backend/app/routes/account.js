import express from "express";
import {
  getHashedPassword,
  createAccount,
  findUserByEmail,
} from "../services/account-service";
import {
  generateTokens,
  getUserFromToken,
  hashPassword,
  verifyPassword,
} from "../utils/auth";

const router = express.Router();

router.post("/signup", async (req, res) => {
  try {
    const { name, email, password } = req.body;

    const existingUser = await findUserByEmail(email);
    if (existingUser) {
      return res.status(400).json({ error: "Email already in use." });
    }

    const createdUser = await createAccount(name, email, password);
    const tokens = generateTokens(createdUser.id); // { accessToken, refreshToken}

    res.status(201).json({
      message: "Account created successfully",
      id: createdUser.id,
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

router.post("/login", async (req, res) => {
  try {
    const { email, password } = req.body;
    const { storedPassword } = await getHashedPassword(email.trim());

    if (!storedPassword) {
      return res
        .status(401)
        .json({ error: "Please check your email or password and try again." });
    }

    let salt, hashedPassword;
    try {
      ({ salt, hashedPassword } = JSON.parse(storedPassword));
    } catch (err) {
      console.error("Failed to parse password in DB", err.message);
      return res.status(500).json({
        error:
          "Something went wrong while processing your login. Please try again later.",
      });
    }

    if (!hashedPassword) {
      res
        .send(401)
        .json({ error: "Please check your email or password and try again." });
    }

    const passwordMatches = verifyPassword(password, salt, hashedPassword);

    if (passwordMatches) {
      const loggedInUser = await findUserByEmail(email.trim());
      const tokens = generateTokens({ id: loggedInUser.id });

      res.status(200).json({
        message: "You have successfully logged in! Welcome back.",
        id: loggedInUser.id,
        tokenPair: tokens,
      });
    } else {
      res
        .status(401)
        .json({ error: "Incorrect email or password. Please try again." });
    }
  } catch (err) {
    console.error("Login error,", err.message);
    res
      .status(500)
      .json({ error: "A server error occurred. Please try again later." });
  }
});
