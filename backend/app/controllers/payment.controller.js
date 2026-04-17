import Stripe from "stripe";
import { updateUserStripeId } from "../services/account-service.js";
import { getOrderById } from "../services/order-service.js";
import { findUniquePayment } from "../services/payment-service.js";

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);

// Stripe 고객 ID 확인/생성
async function ensureStripeCustomerId(user) {
  let customerId = user.stripe_customer_id;

  if (customerId) {
    try {
      await stripe.customers.retrieve(customerId); // Stripe에 존재하는지 검증
    } catch (err) {
      if (err.code === "resource_missing") {
        customerId = null;
      } else {
        console.error("Stripe customer retrieve failed", {
          userId: user.id,
          customerId,
          code: err.code,
        });
        throw new Error("PAYMENT_SERVICE_UNAVAILABLE");
      }
    }
  }

  if (!customerId) {
    const newCustomer = await stripe.customers.create({
      name: user.name,
      email: user.email,
      metadata: { userId: user.id },
    });

    await updateUserStripeId(user.id, newCustomer.id);
    customerId = newCustomer.id;
  }

  return customerId;
}

// // PaymentIntent 생성 및 DB 저장
async function createAndStoreStripePaymentIntent(
  orderId,
  amount,
  currency,
  customerId,
  userId,
) {
  const paymentIntent = await stripe.paymentIntents.create({
    amount,
    currency,
    customer: customerId,
    payment_method_types: ["card"],
    metadata: { userId, orderId }, // 주문 & 사용자 연결 (custom data)
  });

  if (!paymentIntent || !paymentIntent.client_secret) {
    console.error("Stripe PaymentIntent failed:", paymentIntent);
    throw new Error("PAYMENT_INTENT_FAILURE");
  }

  try {
    await createPaymentRecord(orderId, paymentIntent.id, amount, currency);
    return paymentIntent.client_secret;
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
      throw new Error("PAYMENT_INTENT_CANCELLATION_FAILURE");
    }
    throw new Error("PAYMENT_INTENT_FAILURE");
  }
}

export async function getOrCreateClientSecret(orderId, user) {
  const currency = "usd";

  if (!orderId || isNaN(Number(orderId))) {
    throw new Error("INVALID_ORDER_ID");
  }

  const order = await getOrderById(orderId); // 금액 가져오기
  if (!order) {
    console.error("Order not found", { orderId, userId: user.id });
    throw new Error("ORDER_NOT_FOUND");
  }
  if (order.user_id !== user.id) throw new Error("Forbidden");

  const amount = Math.round(order.total_amount * 100);
  const existing = await findUniquePayment(orderId);

  if (existing?.stripe_payment_intent_id) {
    const intent = await stripe.paymentIntents.retrieve(
      existing.stripe_payment_intent_id,
    );

    return { clientSecret: intent.client_secret };
  }

  const customerId = await ensureStripeCustomerId(user);
  const clientSecret = await createAndStoreStripePaymentIntent(
    orderId,
    amount,
    currency,
    customerId,
    user.id,
  );

  return { clientSecret };
}
