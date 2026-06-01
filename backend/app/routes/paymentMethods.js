import express from "express";
import Stripe from "stripe";
import { verifyUserAuth } from "../middleware/auth.middleware.js";
import {
  deleteCard,
  findUniqueStripeMethodId,
  getCardsInfo,
} from "../services/payment.methods-service.js";
import { getPaymentMethodByStripeId } from "../controllers/paymentMethod.controller.js";
import { PAYMENT_ERROR_STATUS } from "../utils/errors.js";

const router = express.Router();
const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);

router.get("/", verifyUserAuth, async (req, res) => {
  try {
    const cards = await getCardsInfo(req.user.id);
    return res.status(200).json(cards);
  } catch (err) {
    console.error("fetching error,", err.message);
    res
      .status(500)
      .json({ error: "Something went wrong while loading the cards data." });
  }
});

router.get("/:stripePaymentMethodId", verifyUserAuth, async (req, res) => {
  try {
    const { stripePaymentMethodId } = req.params;
    const paymentMethod = await getPaymentMethodByStripeId(
      stripePaymentMethodId,
      req.user,
    );
    return res.status(200).json({
      brand: paymentMethod.card.brand,
      last4: paymentMethod.card.last4,
      exp_month: paymentMethod.card.exp_month,
      exp_year: paymentMethod.card.exp_year,
    });
  } catch (err) {
    console.error("fetching error,", err.message);
    const status = PAYMENT_ERROR_STATUS[err.message] ?? 500;
    res
      .status(status)
      .json({ error: "Something went wrong while loading the cards data." });
  }
});

router.delete("/delete/:cardId", verifyUserAuth, async (req, res) => {
  const { cardId } = req.params;
  try {
    const methodId = await findUniqueStripeMethodId(cardId, req.user.id);
    if (!methodId) return res.status(404).json({ error: "FORBIDDEN" });

    try {
      await stripe.paymentMethods.detach(methodId); // 결제 완료된 카드만 삭제됨
    } catch {}
    await deleteCard(cardId, req.user.id);
    res.status(200).json({ message: "Requested card deleted" });
  } catch (err) {
    console.error("update error,", err.message);
    res.status(500).json({ error: "Failed to delete payment method." });
  }
});

export default router;
