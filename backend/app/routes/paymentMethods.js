import express from "express";
import Stripe from "stripe";
import { verifyUserAuth } from "../middleware/auth.middleware.js";
import {
  deleteCard,
  findUniqueStripeMethodId,
  getCardsInfo,
} from "../services/payment.methods-service.js";

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
