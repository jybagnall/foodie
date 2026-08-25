import {
  upsertPaymentFromIntent,
  markPaymentFailed,
  updatePaymentMethod,
  findPaymentByStripeChargeId,
  updatePaymentStatus,
} from "../../services/payment-service.js";
import { updateOrderStatus } from "../../services/order-service.js";
import {
  clearDefaultCard,
  saveCardToDb,
} from "../../services/payment.methods-service.js";
import {
  createRefundRecord,
  updateRefundStatus,
  refundRecordExists,
} from "../../services/refund-service.js";
import {
  STRIPE_METADATA_ORDER_ID,
  STRIPE_METADATA_SAVE_CARD,
  STRIPE_METADATA_SET_AS_DEFAULT,
  STRIPE_METADATA_USER_ID,
} from "../../constants/stripe.js";
import { retrieveStripePaymentMethod } from "../../integrations/stripe/payment-method.js";

// 여기서의 실패: DB 저장 실패, 주문 상태 업데이트 실패, 트랜잭션 롤백, 서버 장애
// 이 실패들은 유저에게 실시간으로 보여줄 수 없음.

// metadata는 모든 값이 string으로 저장됨
export async function handlePaymentIntentSucceeded(client, paymentIntent) {
  const orderId = Number(paymentIntent.metadata?.[STRIPE_METADATA_ORDER_ID]);
  const saveCard =
    paymentIntent.metadata?.[STRIPE_METADATA_SAVE_CARD] === "true";
  const setAsDefault =
    paymentIntent.metadata?.[STRIPE_METADATA_SET_AS_DEFAULT] === "true";
  const userId = Number(paymentIntent.metadata?.[STRIPE_METADATA_USER_ID]);

  if (!paymentIntent.id) {
    throw new Error("Missing id in paymentIntent");
  }
  if (!orderId)
    throw new Error(
      `Missing orderId. intentId: ${paymentIntent.id}, metadata: ${JSON.stringify(paymentIntent.metadata)}`,
    );
  if (saveCard && !userId) {
    throw new Error(
      `Missing userId while saveCard is true. intentId: ${paymentIntent.id}`,
    );
  }

  // Stripe 조회는 DB 작업 시작 전에 미리 끝내둠
  let stripePaymentMethod = null;

  if (saveCard) {
    try {
      stripePaymentMethod = await retrieveStripePaymentMethod(
        paymentIntent.payment_method,
      );
      // { id(stripe_payment_method_id), type, card, customer } = stripePaymentMethod;
    } catch (err) {
      console.error(
        `Failed to retrieve payment method for order ${orderId}, user ${userId}:`,
        err,
      );
    }
  }

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

  if (saveCard && stripePaymentMethod) {
    try {
      await client.query("SAVEPOINT save_card");

      if (setAsDefault) {
        await clearDefaultCard(client, userId);
      }

      const paymentMethodId = await saveCardToDb(
        client,
        stripePaymentMethod,
        userId,
        setAsDefault,
      );

      await updatePaymentMethod(client, paymentMethodId, orderId);
    } catch (err) {
      await client.query("ROLLBACK TO SAVEPOINT save_card"); // 여기까지만 되돌리고 트랜잭션은 유효
      console.error(
        `Failed to save card for order ${orderId}, user ${userId}:`,
        err,
      );
    }
  }

  return { orderId, paymentIntent };
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

const REFUND_TO_PAYMENT_STATUS = {
  succeeded: "refunded",
  failed: "refund_failed",
  canceled: "refund_failed",
  pending: "refund_pending",
};

export async function handleRefundUpdated(client, refundObj) {
  const payment = await findPaymentByStripeChargeId(client, refundObj.charge);

  if (!payment) {
    throw new Error(`Payment not found for charge ${refundObj.charge}`);
  } // payment 없으면 런타임 에러 발생함

  const { id: paymentId, order_id: orderId } = payment;

  const alreadyProcessed = await refundRecordExists(client, refundObj.id);

  const paymentStatus =
    REFUND_TO_PAYMENT_STATUS[refundObj.status] ?? "refund_pending";

  // 환불 요청 데이터가 없음
  if (!alreadyProcessed) {
    await createRefundRecord(client, {
      paymentId: paymentId,
      stripeRefundId: refundObj.id,
      amount: refundObj.amount / 100,
      refundStatus: refundObj.status, // succeeded, failed, canceled
      reason: refundObj.reason,
    });
  } else {
    await updateRefundStatus(client, refundObj.status, refundObj.id);
  }

  // 환불이 실제로 성공했을 때만 주문을 취소 처리
  if (refundObj.status === "succeeded") {
    await updateOrderStatus(client, orderId, "canceled");
  }

  await updatePaymentStatus(client, paymentStatus, refundObj.charge);
}
// refundObj.charge: Stripe의 Charge ID
