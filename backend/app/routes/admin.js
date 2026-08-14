import express from "express";
import { getAdmins } from "../services/admin-service.js";
import { verifyAdminAuth } from "../middleware/auth.middleware.js";
import { validateBody } from "../middleware/validateBody.js";
import pool from "../config/db.js";
import { adminSignup, inviteAdmin } from "../controllers/admin.controller.js";
import { AUTH_ERROR_STATUS } from "../constants/errors.js";

const router = express.Router();

router.get("/", verifyAdminAuth, async (req, res, next) => {
  try {
    const admins = await getAdmins();
    res.status(200).json(admins);
  } catch (err) {
    return next(err);
  }
});

router.post(
  "/admin-signup",
  validateBody("name", "email", "password"),
  async (req, res) => {
    const client = await pool.connect();
    try {
      const { name, email, password, inviteToken } = req.body;
      const { accessToken } = await adminSignup({
        client,
        inviteToken,
        name,
        email,
        password,
      });
      res.status(201).json({
        message: "Admin account created successfully",
        accessToken,
      });
    } catch (err) {
      console.error("Admin signup error:", err);
      const status = AUTH_ERROR_STATUS[err.message] ?? 500;
      return res.status(status).json({
        error: "Something went wrong during admin signup. Please try again.",
      });
    } finally {
      client.release();
    }
  },
);

router.post(
  "/invite",
  verifyAdminAuth,
  validateBody("email"),
  async (req, res, next) => {
    try {
      const { email } = req.body;
      await inviteAdmin(email);
      res
        .status(200)
        .json({ message: "Admin invitation email sent successfully." });
    } catch (err) {
      return next(err);
    }
  },
);

export default router;
