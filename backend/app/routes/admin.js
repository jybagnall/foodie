import express from "express";

import {
  verifyAdminInvitation,
  invalidateAdminInvitation,
  createAdminInvitation,
} from "../services/admin-service.js";
import { createAccount, findUserByEmail } from "../services/account-service.js";
import { generateTokens } from "../utils/auth.js";
import { verifyAdminAuth } from "../middleware/auth.middleware.js";
import { sendAdminInvitationEmail } from "../utils/email-admin.js";

const router = express.Router();

router.post("/admin-signup", async (req, res) => {
  try {
    const { name, email, password, inviteToken } = req.body;

    const isInvited = await verifyAdminInvitation(inviteToken, email);
    if (!isInvited) {
      return res.status(403).json({
        error: "This invitation link is invalid, expired, or already used.",
      });
    }

    const existingAdmin = await findUserByEmail(email);
    if (existingAdmin) {
      return res.status(400).json({ error: "Email already in use." });
    }

    const createdAdmin = await createAccount(name, email, password, "admin");
    const tokens = generateTokens({ id: createdAdmin.id, role: "admin" });
    // tokens = { accessToken, refreshToken}
    await invalidateAdminInvitation(email); //📍토큰 대신에 이메일로

    res.status(201).json({
      message: "Admin account created successfully",
      id: createdAdmin.id,
      tokenPair: tokens,
    });
  } catch (err) {
    if (err.code === "23505") {
      // PostgreSQL unique_violation
      return res.status(400).json({ error: "Email already registered." });
    } else {
      return res
        .status(500)
        .json({ error: "Something went wrong while creating your account." });
    }
  }
});

router.post("/invite", verifyAdminAuth, async (req, res) => {
  try {
    const { email } = req.body;
    const admin = req.user; // JWT에서 추출된 로그인 관리자 (id, role)

    if (admin.role !== "admin") {
      return res.status(403).json({ error: "Unauthorized" });
    }

    // 초대 토큰 생성
    const rawToken = await createAdminInvitation(email);

    const inviteLink = `${process.env.FRONTEND_URL}/create-admin-account?token=${rawToken}`;

    await sendAdminInvitationEmail(email, inviteLink);

    res.status(200).json({ message: "Invitation sent successfully." });
  } catch (err) {
    res.status(500).json({ error: "Failed to send admin invite." });
  }
});
 
export default router;
