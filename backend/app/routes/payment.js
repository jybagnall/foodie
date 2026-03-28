import express from "express";
import Stripe from "stripe";
import { updateUserStripeId } from "../services/account-service.js";
import {
  createPaymentRecord,
  findUniquePayment,
} from "../services/payment-service.js";
import { verifyUserAuth } from "../middleware/auth.middleware.js";
import { getOrderById } from "../services/order-service.js";

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
    const existing = await findUniquePayment(orderId);
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

// 유저가 결제 페이지에서 새로고침을 하면
// 같은 주문에 대한 PaymentIntent 가 중복 생성될 수 있음.

router.post("/create-payment-intent", verifyUserAuth, async (req, res) => {
  try {
    const { orderId } = req.body;
    const currency = "usd";
    let customerId = req.user.stripe_customer_id;

    if (!orderId || isNaN(Number(orderId))) {
      return res.status(400).json({
        errorCode: "INVALID_ORDER_ID",
        error: "Something went wrong during payment. Please try again.",
      });
    }

    if (customerId) {
      try {
        await stripe.customers.retrieve(customerId); // Stripe에 존재하는지 검증
      } catch (err) {
        if (err.code === "resource_missing") {
          customerId = null;
        } else {
          console.error("Stripe customer retrieve failed", {
            userId: req.user.id,
            customerId,
            code: err.code,
          });

          return res.status(502).json({
            errorCode: "PAYMENT_SERVICE_UNAVAILABLE",
            error:
              "Payment service is temporarily unavailable. Please try again later.",
          });
        }
      }
    }

    if (!customerId) {
      const newCustomer = await stripe.customers.create({
        name: req.user.name,
        email: req.user.email,
        metadata: { userId: req.user.id },
      });

      await updateUserStripeId(req.user.id, newCustomer.id);
      customerId = newCustomer.id;
    }

    const order = await getOrderById(orderId); // 금액 가져오기
    if (!order) {
      console.error("Order not found", { orderId, userId: req.user.id });
      return res.status(404).json({
        errorCode: "ORDER_NOT_FOUND",
        error: "Something went wrong during payment. Please try again.",
      });
    }
    if (order.user_id !== req.user.id)
      return res.status(403).json({ error: "Forbidden" });

    const amount = Math.round(order.total_amount * 100);
    const existing = await findUniquePayment(orderId);

    if (existing?.stripe_payment_intent_id) {
      const intent = await stripe.paymentIntents.retrieve(
        existing.stripe_payment_intent_id,
      );
      return res.json({ clientSecret: intent.client_secret });
    }

    const paymentIntent = await stripe.paymentIntents.create({
      amount,
      currency,
      customer: customerId,
      payment_method_types: ["card"],
      metadata: {
        userId: req.user.id, // 결제 추적을 위해 유용
        orderId,
      }, // 주문 & 사용자 연결 (custom data)
    });

    if (!paymentIntent || !paymentIntent.client_secret) {
      console.error("Stripe PaymentIntent failed:", paymentIntent);
      return res.status(400).json({
        error: "Something went wrong during payment. Please try again.",
      });
    }

    try {
      await createPaymentRecord(orderId, paymentIntent.id, amount, currency);
    } catch (dbErr) {
      console.error("DB insert failed after PaymentIntent creation", {
        paymentIntentId: paymentIntent.id,
        orderId,
        error: dbErr.message,
      });

      try {
        await stripe.paymentIntents.cancel(paymentIntent.id);
      } catch (cancelErr) {
        console.error("Failed to cancel orphaned PaymentIntent", {
          paymentIntentId: paymentIntent.id,
          error: cancelErr.message,
        });
      }
      return res.status(500).json({
        error: "Something went wrong during payment. Please try again.",
      });
    }
    res.json({ clientSecret: paymentIntent.client_secret });
  } catch (err) {
    console.error("Stripe payment session error,", err.message);
    return res.status(500).json({
      error: "Something went wrong during payment. Please try again.",
    });
  }
});

export default router;
