import express from "express";
import {
  verifyAdminInvitation,
  invalidateAdminInvitation,
  createAdminInvitation,
} from "../services/admin-service.js";
import { createAccount, findUserByEmail } from "../services/account-service.js";
import { generateTokens } from "../utils/auth.js";
import { verifyAdminAuth } from "../middleware/auth.middleware.js";
import { sendAdminInvitationEmail } from "../utils/email.js";
import { validateBody } from "../middleware/validateBody.js";
import pool from "../config/db.js";

const router = express.Router();

router.post(
  "/admin-signup",
  validateBody("name", "email", "password"),
  async (req, res) => {
    const client = await pool.connect();
    try {
      const { name, email, password, inviteToken } = req.body;
      const invitedRecord = await verifyAdminInvitation(inviteToken, email);

      if (!invitedRecord) {
        return res.status(403).json({
          error: "This invitation link is invalid, expired, or already used.",
        });
      }

      const existingAdmin = await findUserByEmail(email);
      if (existingAdmin) {
        return res.status(400).json({ error: "Email already in use." });
      }

      await client.query("BEGIN");
      const newAdmin = await createAccount(
        name,
        email,
        password,
        client,
        "admin",
      );
      const { accessToken } = generateTokens({
        id: newAdmin.id,
        name: newAdmin.name,
        email: newAdmin.email,
        role: newAdmin.role,
      });
      await invalidateAdminInvitation(inviteToken, client); // 토큰 무효화
      await client.query("COMMIT");
      res.status(201).json({
        message: "Admin account created successfully",
        accessToken,
      });
    } catch (err) {
      await client.query("ROLLBACK");
      if (err.code === "23505") {
        // PostgreSQL unique_violation
        return res.status(400).json({ error: "Email already registered." });
      } else {
        return res
          .status(500)
          .json({ error: "Something went wrong while creating your account." });
      }
    } finally {
      client.release();
    }
  },
);

router.post(
  "/invite",
  verifyAdminAuth,
  validateBody("email"),
  async (req, res) => {
    try {
      const { email } = req.body;
      const admin = req.user; // JWT에서 추출된 로그인 관리자 (id, role)

      if (admin.role !== "admin") {
        return res.status(403).json({ error: "Unauthorized" });
      }

      // 초대 토큰 생성
      const rawToken = await createAdminInvitation(email);
      const FRONTEND_URL = "http://127.0.0.1:5173";
      const inviteLink = `${FRONTEND_URL}/create-admin-account?token=${rawToken}`;
      await sendAdminInvitationEmail(email, inviteLink);

      res
        .status(200)
        .json({ message: "Admin invitation email sent successfully." });
    } catch (err) {
      res.status(500).json({ error: "Failed to send admin invite." });
    }
  },
);

export default router;
