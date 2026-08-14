import express from "express";
import { verifyUserAuth } from "../middleware/auth.middleware.js";
import { getCardsInfo } from "../services/payment.methods-service.js";
import {
  getPaymentMethodByStripeId,
  removeCard,
} from "../controllers/paymentMethod.controller.js";
import { PAYMENT_ERROR_STATUS } from "../constants/errors.js";

const router = express.Router();

router.get("/", verifyUserAuth, async (req, res, next) => {
  try {
    const cards = await getCardsInfo(req.user.id);
    return res.status(200).json(cards);
  } catch (err) {
    return next(err);
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
    console.error("fetching error,", err);
    const status = PAYMENT_ERROR_STATUS[err.message] ?? 500;
    res
      .status(status)
      .json({ error: "Something went wrong while loading the cards data." });
  }
});

router.delete("/:cardId", verifyUserAuth, async (req, res, next) => {
  try {
    const { cardId } = req.params;
    await removeCard(cardId, req.user.id);
    res.status(200).json({ message: "Requested card deleted" });
  } catch (err) {
    return next(err);
  }
});

export default router;
