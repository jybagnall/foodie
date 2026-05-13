import Stripe from "stripe";
import {
  upsertPaymentFromIntent,
  markPaymentFailed,
  updatePaymentMethod,
  findPaymentByStripeChargeId,
  updatePaymentStatus,
} from "../../services/payment-service.js";
import { updateOrderStatus } from "../../services/order-service.js";
import { sendOrderConfirmationEmail } from "../../utils/email-orderConfirm.js";
import {
  clearDefaultCard,
  saveCardToDb,
} from "../../services/payment.methods-service.js";
import {
  createRefundRecord,
  markRefundAsCompleted,
  refundRecordExists,
} from "../../services/refund-service.js";

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
    const stripePaymentMethod = await stripe.paymentMethods.retrieve(
      paymentIntent.payment_method,
    );
    // { id(stripe_payment_method_id), type, card, customer } = stripePaymentMethod;

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

export async function handleRefundUpdated(client, refundObj) {
  if (refundObj.status !== "succeeded") return; // 완료된 것만 처리

  const payment = await findPaymentByStripeChargeId(client, refundObj.charge);

  if (!payment) {
    console.error("Payment not found for charge", {
      chargeId: refundObj.charge,
    });
    return;
  }

  const { id: paymentId, order_id: orderId } = payment;
  const alreadyProcessed = await refundRecordExists(client, refundObj.id);

  // 환불 요청 데이터가 없음
  if (!alreadyProcessed) {
    await createRefundRecord(client, {
      paymentId: paymentId,
      stripeRefundId: refundObj.id,
      amount: refundObj.amount / 100,
      refundStatus: "succeeded",
      reason: refundObj.reason,
    });
    await updatePaymentStatus(client, "refund_pending", refundObj.charge);
    await updateOrderStatus(client, orderId, "cancelled");
  } else {
    await markRefundAsCompleted(client, "succeeded", refundObj.id);
  }
}
