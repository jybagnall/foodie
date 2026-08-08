import { stripe } from "../config/stripe.js";
import pool from "../config/db.js";
import { getMenuPrices } from "../services/menu-service.js";
import { createRefundRecord } from "../services/refund-service.js";
import { getOrderById, updateOrderStatus } from "../services/order-service.js";
import {
  updatePendingPayment,
  findUniquePaymentByOrderId,
  updatePaymentStatus,
} from "../services/payment-service.js";
import {
  calculateDeliveryFee,
  calculateOrderSubTotal,
  calculateOrderTotal,
  calculateTaxForTest,
  isWithinCancellationWindow,
} from "../utils/orderCalculations.js";
import {
  ORDER_STATUS,
  CANCELLABLE_PAYMENT_STATUSES,
  PAYMENT_STATUS,
  REFUND_STATUS,
  ORDER_CANCEL_WINDOW_MINUTES,
} from "../constants/orderStates.js";
import { cancelStripePaymentIntent } from "../utils/stripe.js";
import { withTransaction } from "../utils/db.js";
import { ORDER_ERROR } from "../constants/errors.js";
import { isValidOrderId } from "../utils/validators.js";

// 1. 메뉴 가격 조회 2. 가격 매핑 3. 총액 계산
export async function buildOrderWithPrices(client, address, orderPayload) {
  const menuIds = [...new Set(orderPayload.items.map((i) => i.menu_id))];
  const itemsWithPrice = await getMenuPrices(client, menuIds);
  // [{ id, price }, {}]

  const pricedMap = new Map(
    itemsWithPrice.map((item) => [item.id, item.price]),
  ); // [ [], [] ] 즉, priceMap.get(item.id)은 item.price

  for (const item of orderPayload.items) {
    if (!pricedMap.has(item.menu_id)) {
      throw new Error(ORDER_ERROR.ITEMS_UNAVAILABLE);
    } // 존재하지 않는 menu_id
  }

  const completeOrder = orderPayload.items.map((orderItem) => ({
    ...orderItem,
    price: pricedMap.get(orderItem.menu_id),
  }));
  const subTotalAmount = calculateOrderSubTotal(completeOrder);
  const deliveryFee = calculateDeliveryFee(subTotalAmount);
  const taxAmount = calculateTaxForTest(subTotalAmount, deliveryFee, address);
  const totalAmount = calculateOrderTotal(
    subTotalAmount + deliveryFee + taxAmount,
  );

  return { subTotalAmount, deliveryFee, taxAmount, totalAmount, completeOrder };
}

export async function cancelOrder(orderId, user) {
  if (!isValidOrderId(orderId)) {
    throw new Error(ORDER_ERROR.INVALID_ORDER_ID);
  }

  const order = await getOrderById(orderId);
  if (!order) throw new Error(ORDER_ERROR.ORDER_NOT_FOUND);
  if (order.user_id !== user.id) throw new Error(ORDER_ERROR.FORBIDDEN);
  if (
    !isWithinCancellationWindow(order.created_at, ORDER_CANCEL_WINDOW_MINUTES)
  )
    throw new Error(ORDER_ERROR.ORDER_NOT_CANCELLABLE);

  if (order.status === ORDER_STATUS.PAID) {
    return cancelPaidOrder(orderId);
  }

  if (order.status === ORDER_STATUS.PENDING) {
    return cancelPendingOrder(orderId);
  }

  throw new Error(ORDER_ERROR.ORDER_NOT_CANCELLABLE);
  // 예상하지 않은 order.status가 도착했을 때 조용히 끝내지 않고 에러를 던짐
}

async function cancelPaidOrder(orderId) {
  const payment = await findCancellablePayment(orderId);
  if (!payment.stripe_charge_id) throw new Error(ORDER_ERROR.CHARGE_NOT_FOUND);
  if (payment.payment_status !== PAYMENT_STATUS.SUCCEEDED)
    throw new Error(ORDER_ERROR.PAYMENT_NOT_REFUNDABLE);

  // amount 생략 시 전액 환불
  const refund = await stripe.refunds.create(
    {
      payment_intent: payment.stripe_payment_intent_id,
    },
    {
      idempotencyKey: `refund-for-order-${orderId}`,
    },
  );

  // 카드사에 환불 신호 전송 중/성공일 땐 정상 진행 (pending, succeeded)
  // failed/canceled 만 진짜 실패.
  if (
    refund.status === REFUND_STATUS.FAILED ||
    refund.status === REFUND_STATUS.CANCELED
  ) {
    throw new Error(ORDER_ERROR.REFUND_FAILED);
  }

  try {
    await withTransaction(pool, async (client) => {
      await createRefundRecord(client, {
        paymentId: payment.id,
        stripeRefundId: refund.id,
        amount: refund.amount / 100,
        refundStatus: refund.status,
        reason: refund.reason,
      });
      // 대부분 "succeeded" 상태임

      const updatedCount = await updatePaymentStatus(
        client,
        PAYMENT_STATUS.REFUND_PENDING,
        payment.stripe_charge_id,
      );

      if (updatedCount === 0) {
        throw new Error(ORDER_ERROR.PAYMENT_STATUS_CONFLICT);
      }

      await updateOrderStatus(client, orderId, ORDER_STATUS.CANCELED);
    });
  } catch (err) {
    if (err.message === ORDER_ERROR.PAYMENT_STATUS_CONFLICT) throw err;
    console.error("Post-refund DB update failed:", err);
    throw new Error(ORDER_ERROR.POST_REFUND_DB_FAILURE, { cause: err });
  }
}

export async function cancelPendingOrder(orderId) {
  const payment = await findCancellablePayment(orderId);

  if (!CANCELLABLE_PAYMENT_STATUSES.includes(payment.payment_status))
    throw new Error(ORDER_ERROR.ORDER_NOT_CANCELLABLE);

  await cancelStripePaymentIntent(payment.stripe_payment_intent_id);

  try {
    await withTransaction(pool, async (client) => {
      await updatePendingPayment(client, orderId, PAYMENT_STATUS.CANCELED);
      await updateOrderStatus(client, orderId, ORDER_STATUS.CANCELED);
    });
  } catch (err) {
    console.error("Order cancellation DB update failed:", err);
    throw new Error(ORDER_ERROR.POST_DB_FAILURE, { cause: err });
  }
}

export async function expirePendingOrder(orderId) {
  const payment = await findCancellablePayment(orderId);

  if (payment.payment_status !== PAYMENT_STATUS.REQUIRES_PAYMENT)
    throw new Error(ORDER_ERROR.ORDER_NOT_EXPIRABLE);

  await cancelStripePaymentIntent(payment.stripe_payment_intent_id);

  try {
    await withTransaction(pool, async (client) => {
      await updatePendingPayment(client, orderId, PAYMENT_STATUS.EXPIRED);
      await updateOrderStatus(client, orderId, ORDER_STATUS.EXPIRED);
    });
  } catch (err) {
    console.error("Order expiration DB update failed:", err);
    throw new Error(ORDER_ERROR.POST_DB_FAILURE, { cause: err });
  }
}

async function findCancellablePayment(orderId) {
  const payment = await findUniquePaymentByOrderId(orderId);
  if (!payment) throw new Error(ORDER_ERROR.PAYMENT_NOT_FOUND);
  if (!payment.stripe_payment_intent_id)
    throw new Error(ORDER_ERROR.PAYMENT_INTENT_NOT_FOUND);

  return payment;
}
