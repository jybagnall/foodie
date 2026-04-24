import express from "express";
import Stripe from "stripe";
import { findUniquePaymentByOrderId } from "../services/payment-service.js";
import { verifyUserAuth } from "../middleware/auth.middleware.js";
import {
  getOrCreateClientSecret,
  processSavedCardPayment,
} from "../controllers/payment.controller.js";
import { PAYMENT_ERROR_STATUS } from "../utils/errors.js";

const router = express.Router();
const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);

// 에러 메시지들을 다듬을 것.
// router.post("/cancel-order/:orderId", verifyUserAuth, async (req, res) => {
//   try {
//     const { orderId } = req.params;
//     const payment = await findUniquePayment(orderId);

//     if (!payment) {
//       return res.status(404).json({
//         error: "Order not found. Please try again.",
//       });
//     }

//     if (payment?.payment_status === "succeeded") {
//       await stripe.refunds.create({
//         payment_intent: payment.stripe_payment_intent_id,
//       });
//       // await updatePaymentStatus(payment.id, "refunded"); 함수 존재하지 않음
//       // await updateOrderStatus("cancelled", orderId);
//     }

//     res.status(200).json({ message: "Order cancelled and refunded." });
//   } catch (err) {
//     console.error("Refund failed:", err.message);
//     return res.status(500).json({
//       error: "We failed to cancel order. Please try again.",
//     });
//   }
// });

router.get("/client-secret", verifyUserAuth, async (req, res) => {
  try {
    const orderId = req.query.order_id;
    const existing = await findUniquePaymentByOrderId(orderId);
    if (!existing) return res.status(404).json({ error: "Payment not found." });

    const intent = await stripe.paymentIntents.retrieve(
      existing.stripe_payment_intent_id,
    );
    res.json({ clientSecret: intent.client_secret });
  } catch (err) {
    console.error("Stripe verification error:", err);
    return res.status(500).json({
      error: "Something went wrong during payment. Please try again.",
    });
  }
});

router.get("/verify", verifyUserAuth, async (req, res) => {
  try {
    const paymentIntentId = req.query.payment_intent;
    const paymentIntent = await stripe.paymentIntents.retrieve(paymentIntentId);

    return res.status(200).json({ status: paymentIntent.status });
  } catch (err) {
    console.error("Stripe verification error:", err);
    return res.status(500).json({
      error: "Something went wrong during payment. Please try again.",
    });
  }
});

router.post("/charge-saved-card", verifyUserAuth, async (req, res) => {
  try {
    const { orderId, cardId } = req.body;
    await processSavedCardPayment(orderId, cardId, req.user.id);
    res.status(200).json({ success: true });
  } catch (err) {
    console.error("Saved card charge failed:", err);
    const status = PAYMENT_ERROR_STATUS[err.message] ?? 500;
    return res.status(status).json({
      error: "Something went wrong during payment. Please try again.",
    });
  }
});

// 유저가 결제 페이지에서 새로고침을 하면
// 같은 주문에 대한 PaymentIntent 가 중복 생성될 수 있음.
router.post("/create-payment-intent", verifyUserAuth, async (req, res) => {
  try {
    const { orderId } = req.body;
    const { clientSecret } = await getOrCreateClientSecret(orderId, req.user);
    res.json({ clientSecret });
  } catch (err) {
    console.error("Stripe payment session error,", err.message);
    const status = PAYMENT_ERROR_STATUS[err.message] ?? 500;
    return res.status(status).json({
      error: "Something went wrong during payment. Please try again.",
    });
  }
});

export default router;
