import Stripe from "stripe";
import {
  upsertPaymentFromIntent,
  markPaymentFailed,
  updatePaymentMethod,
} from "../../services/payment-service.js";
import { updateOrderStatus } from "../../services/order-service.js";
import { sendOrderConfirmationEmail } from "../../utils/email-orderConfirm.js";
import {
  clearDefaultCard,
  saveCardToDb,
} from "../../services/payment.methods-service.js";

// 여기서의 실패: DB 저장 실패, 주문 상태 업데이트 실패, 트랜잭션 롤백, 서버 장애
// 이 실패들은 유저에게 실시간으로 보여줄 수 없음.

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);

// metadata는 모든 값이 string으로 저장됨
export async function handlePaymentIntentSucceeded(client, paymentIntent) {
  const orderId = Number(paymentIntent.metadata?.orderId);
  const saveCard = paymentIntent.metadata?.saveCard === "true";
  const setAsDefault = paymentIntent.metadata?.setAsDefault === "true";
  const userId = Number(paymentIntent.metadata?.userId);

  if (!paymentIntent.id) {
    throw new Error("Missing id in paymentIntent");
  }
  if (!orderId)
    throw new Error(
      `Missing orderId. intentId: ${paymentIntent.id}, metadata: ${JSON.stringify(paymentIntent.metadata)}`,
    );

  // { id(stripe_payment_method_id), type, card, customer } = stripePaymentMethod;
  const stripePaymentMethod = saveCard
    ? await stripe.paymentMethods.retrieve(paymentIntent.payment_method)
    : null;

  await upsertPaymentFromIntent(client, {
    order_id: orderId,
    stripe_payment_intent_id: paymentIntent.id,
    stripe_payment_method_id: paymentIntent.payment_method,
    amount: paymentIntent.amount_received / 100,
    currency: paymentIntent.currency,
    payment_status: paymentIntent.status,
    stripe_charge_id: paymentIntent.latest_charge,
  });

  await updateOrderStatus(client, orderId, "paid");

  if (saveCard) {
    if (setAsDefault) {
      await clearDefaultCard(client, userId);
    }

    const paymentMethodId = await saveCardToDb(
      client,
      stripePaymentMethod,
      userId,
      setAsDefault,
    );

    await updatePaymentMethod(client, paymentMethodId, orderId); //
  }

  await sendOrderConfirmationEmail(client, orderId, paymentIntent);
}

export async function handlePaymentIntentFailed(client, paymentIntent) {
  const failureMsg = paymentIntent.last_payment_error?.message;

  if (!paymentIntent.id) {
    console.warn(
      "handlePaymentIntentFailed: missing paymentIntent.id, skipping",
      paymentIntent,
    );
    return;
  }

  await markPaymentFailed(client, paymentIntent.id, failureMsg);
}
