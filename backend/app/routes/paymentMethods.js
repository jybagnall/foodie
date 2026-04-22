// GET    /payment-methods        // 카드 목록 조회
// POST   /payment-methods        // 카드 저장 (optional)
// DELETE /payment-methods/:id    // 카드 삭제
// PATCH  /payment-methods/:id/default // 기본 카드 설정

import express from "express";
import { verifyUserAuth } from "../middleware/auth.middleware.js";

const router = express.Router();

// router.get("/verify", verifyUserAuth, async (req, res) => {
//   try {
//     const paymentIntentId = req.query.payment_intent;
//     const paymentIntent = await stripe.paymentIntents.retrieve(paymentIntentId);

//     return res.status(200).json({ status: paymentIntent.status });
//   } catch (err) {
//     console.error("Stripe verification error:", err);
//     return res.status(500).json({
//       error: "Something went wrong during payment. Please try again.",
//     });
//   }
// });

// router.post("/create-payment-intent", verifyUserAuth, async (req, res) => {
//   try {
//     const { orderId } = req.body;
//     const { clientSecret } = await getOrCreateClientSecret(orderId, req.user);
//     res.json({ clientSecret });
//   } catch (err) {
//     console.error("Stripe payment session error,", err.message);
//     const status = PAYMENT_ERROR_STATUS[err.message] ?? 500;
//     return res.status(status).json({
//       error: "Something went wrong during payment. Please try again.",
//     });
//   }
// });

export default router;
