import express from "express";
import Stripe from "stripe";
import { findUniquePaymentByOrderId } from "../services/payment-service.js";
import { verifyUserAuth } from "../middleware/auth.middleware.js";
import {
  getOrCreateClientSecret,
  getExistingClientSecret,
  processSavedCardPayment,
  verifyStripePayment,
} from "../controllers/payment.controller.js";
import { PAYMENT_ERROR_STATUS } from "../utils/errors.js";

const router = express.Router();
const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);

router.get("/client-secret", verifyUserAuth, async (req, res) => {
  try {
    const orderId = req.query.order_id;
    const { clientSecret } = await getExistingClientSecret(orderId, req.user);
    res.json({ clientSecret });
  } catch (err) {
    console.error("Stripe verification error:", err);
    const status = PAYMENT_ERROR_STATUS[err.message] ?? 500;
    return res.status(status).json({
      error: "Something went wrong during payment. Please try again.",
    });
  }
});

router.get("/verify", verifyUserAuth, async (req, res) => {
  try {
    const { payment_intent: paymentIntentId, order_id: orderId } = req.query;

    const { paymentIntentStatus, lastPaymentError } = await verifyStripePayment(
      paymentIntentId,
      orderId,
      req.user,
    );

    return res.status(200).json({
      paymentIntentStatus,
      lastPaymentError,
    });
  } catch (err) {
    console.error("Stripe verification error:", err);
    const status = PAYMENT_ERROR_STATUS[err.message] ?? 500;
    return res.status(status).json({
      error: "Something went wrong during payment. Please try again.",
    });
  }
});

router.post("/charge-saved-card", verifyUserAuth, async (req, res) => {
  try {
    const { orderId, cardId } = req.body;
    const { paymentIntent, requiresAction, clientSecret } =
      await processSavedCardPayment(orderId, cardId, req.user.id);
    res.status(200).json({ paymentIntent, requiresAction, clientSecret });
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

// Webhook이 실행될 때 paymentIntent.metadata.saveCard를 읽어서 카드를 저장할지 결정

router.patch("/update-payment-intent", verifyUserAuth, async (req, res) => {
  try {
    const { orderId, saveCard, setAsDefault } = req.body;
    const payment = await findUniquePaymentByOrderId(orderId);
    if (!payment)
      return res
        .status(404)
        .json({ error: "Order not found. Please try again." });

    await stripe.paymentIntents.update(payment.stripe_payment_intent_id, {
      metadata: {
        saveCard: String(saveCard),
        setAsDefault: String(setAsDefault),
      },
      ...(saveCard && { setup_future_usage: "on_session" }),
    });

    res.json({ success: true });
  } catch (err) {
    console.error("Stripe payment session error,", err.message);
    const status = PAYMENT_ERROR_STATUS[err.message] ?? 500;
    return res.status(status).json({
      error: "Something went wrong during payment. Please try again.",
    });
  }
});

export default router;
