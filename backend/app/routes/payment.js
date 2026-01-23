import express from "express";
import Stripe from "stripe";
import { updateOrderStatus } from "../services/order-service.js";
import { saveStripeCustomerId } from "../services/account-service.js";
import { updateUserStripeId } from "../services/account-service.js";
import {
  findUniqueOrder,
  savePaymentInfo,
  updatePaymentStatus,
} from "../services/payment-service.js";
import { verifyUserAuth } from "../middleware/auth.middleware.js";

const router = express.Router();
const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);

// 에러 메시지들을 다듬을 것.
router.post("/cancel-order/:orderId", verifyUserAuth, async (req, res) => {
  try {
    const { orderId } = req.params;
    const payment = await findUniqueOrder(orderId);

    if (!payment) {
      return res.status(404).json({
        error: "Order not found. Please try again.",
      });
    }

    if (payment?.payment_status === "succeeded") {
      await stripe.refunds.create({
        payment_intent: payment.stripe_payment_intent_id,
      });
      await updatePaymentStatus(payment.id, "refunded");
      await updateOrderStatus("cancelled", orderId);
    }

    res.status(200).json({ message: "Order cancelled and refunded." });
  } catch (err) {
    console.error("Refund failed:", err.message);
    return res.status(500).json({
      error: "We failed to cancel order. Please try again.",
    });
  }
});

//Stripe Customer는 한 번 생성되면 지속적인 재사용이 권장됨, 따라서
// 삭제보다 “비활성화”하는 게 원칙
router.post("/create-payment-intent", verifyUserAuth, async (req, res) => {
  try {
    const { amount, currency, orderId } = req.body;
    let customerId = req.user.stripe_customer_id;
    let customerExists = true;

    try {
      await stripe.customers.retrieve(customerId);
    } catch (err) {
      if (err.code === "resource_missing") {
        customerExists = false;
      } else {
        console.error("Unexpected Stripe error:", err);
        throw err;
      }
    }

    if (!customerId || !customerExists) {
      const newCustomer = await stripe.customers.create({
        name: req.user.name,
        email: req.user.email,
        metadata: { userId: req.user.id },
      });

      await updateUserStripeId(req.user.id, newCustomer.id);
      customerId = newCustomer.id;
    }

    // "off_session": 자동 결제
    const paymentIntent = await stripe.paymentIntents.create({
      amount,
      currency,
      customer: customerId,
      automatic_payment_methods: { enabled: true },
      setup_future_usage: req.body.saveCard ? "off_session" : undefined,
      metadata: {
        userId: req.user?.id, // 결제 추적을 위해 유용
        orderId,
      },
    });

    if (!paymentIntent || !paymentIntent.client_secret) {
      console.error("Stripe PaymentIntent failed:", paymentIntent);
      return res
        .status(400)
        .json({ error: "Stripe payment initialization failed." });
    }

    res.json({ clientSecret: paymentIntent.client_secret });
  } catch (err) {
    console.error("Stripe payment session error,", err.message);
    return res.status(500).json({
      error: "Failed to initialize payment session. Please try again later.",
    });
  }
});

router.post("/pay-order", verifyUserAuth, async (req, res) => {
  try {
    const {
      order_id,
      stripe_payment_intent_id,
      amount,
      currency,
      payment_status,
      payment_method,
      receipt_url,
      card_brand,
      card_last4,
      card_exp_month,
      card_exp_year,
    } = req.body;

    const paymentDetails = {
      user_id: req.user.id,
      order_id,
      stripe_payment_intent_id,
      stripe_customer_id: req.user.stripe_customer_id,
      amount,
      currency,
      payment_status,
      payment_method,
      receipt_url,
      card_brand,
      card_last4,
      card_exp_month,
      card_exp_year,
    };

    await savePaymentInfo(paymentDetails);
    await updateOrderStatus("paid", order_id);
    res.status(201).json({ message: "Payment stored successfully." });
  } catch (err) {
    console.error("Order error,", err.message);
    if (err.type === "StripeCardError") {
      return res.status(402).json({
        error:
          "Your card was declined. Please check your payment details and try again.",
      });
    } else if (err.code === "ECONNREFUSED" || err.code === "ENETUNREACH") {
      return res.status(500).json({
        error:
          "A network issue occurred while processing your payment. Please try again later.",
      });
    } else {
      return res.status(500).json({
        error:
          "We're having trouble connecting to the payment service. Please try again in a few moments.",
      });
    }
  }
});

export default router;
