import express from "express";
import { verifyUserAuth } from "../middleware/auth.middleware.js";
import {
  getOrCreateClientSecret,
  getExistingClientSecret,
  processSavedCardPayment,
  verifyStripePayment,
  updatePaymentIntentMetadata,
} from "../controllers/payment.controller.js";
import { PAYMENT_ERROR, PAYMENT_ERROR_STATUS } from "../constants/errors.js";
import { parseBoolean, parsePositiveInt } from "../utils/parsers.js";

const router = express.Router();

router.get("/client-secret", verifyUserAuth, async (req, res) => {
  try {
    const orderId = parsePositiveInt(
      req.query.order_id,
      PAYMENT_ERROR.INVALID_ORDER_ID,
    );

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
    const orderId = parsePositiveInt(
      req.query.order_id,
      PAYMENT_ERROR.INVALID_ORDER_ID,
    );
    const { payment_intent: paymentIntentId } = req.query;
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
    const cardId = parsePositiveInt(
      req.body.cardId,
      PAYMENT_ERROR.INVALID_CARD_ID,
    );
    const orderId = parsePositiveInt(
      req.body.orderId,
      PAYMENT_ERROR.INVALID_ORDER_ID,
    );
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
    const orderId = parsePositiveInt(
      req.body.orderId,
      PAYMENT_ERROR.INVALID_ORDER_ID,
    );
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
    const saveCard = parseBoolean(
      req.body.saveCard,
      PAYMENT_ERROR.INVALID_SAVE_CARD_FLAG,
    );
    const setAsDefault = parseBoolean(
      req.body.setAsDefault,
      PAYMENT_ERROR.INVALID_SET_DEFAULT_FLAG,
    );
    const orderId = parsePositiveInt(
      req.body.orderId,
      PAYMENT_ERROR.INVALID_ORDER_ID,
    );
    const userId = req.user.id;

    await updatePaymentIntentMetadata({
      orderId,
      userId,
      saveCard,
      setAsDefault,
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
