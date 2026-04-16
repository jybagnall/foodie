import Stripe from "stripe";
import { updateUserStripeId } from "../services/account-service";
import { getOrderById } from "../services/order-service";
import { findUniquePayment } from "../services/payment-service";

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);

export async function getOrCreatePaymentIntent(req, res) {
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
}
