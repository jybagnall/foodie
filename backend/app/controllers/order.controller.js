import { stripe } from "../config/stripe.js";
import { getMenuPrices } from "../services/menu-service.js";
import { getOrderById, updateOrderStatus } from "../services/order-service.js";
import {
  updatePendingPayment,
  findUniquePaymentByOrderId,
  updatePaymentStatus,
} from "../services/payment-service.js";
import {
  calculateDeliveryFee,
  calculateOrderSubTotal,
  calculateTaxForTest,
  isWithinCancellationWindow,
} from "../utils/orderCalculations.js";
import { createRefundRecord } from "../services/refund-service.js";
import pool from "../config/db.js";
import { CANCELLABLE_PAYMENT_STATUSES } from "../constants/payment.js";

// 1. 메뉴 가격 조회 2. 가격 매핑 3. 총액 계산
export async function buildOrderWithPrices(client, address, orderPayload) {
  const menuIds = orderPayload.items.map((i) => i.menu_id);
  const itemsWithPrice = await getMenuPrices(client, menuIds); // [{ id, price }, {}]

  // 유저가 존재하지 않는 menu_id를 보냈을 때
  if (itemsWithPrice.length !== menuIds.length) {
    throw new Error("ITEMS_UNAVAILABLE");
  }

  const pricedMap = new Map(
    itemsWithPrice.map((item) => [item.id, item.price]),
  ); // [ [], [] ] 즉, priceMap.get(item.id)은 item.price
  const completeOrder = orderPayload.items.map((orderItem) => ({
    ...orderItem,
    price: pricedMap.get(orderItem.menu_id) ?? null,
  }));
  const subTotalAmount = calculateOrderSubTotal(completeOrder);
  const deliveryFee = calculateDeliveryFee(subTotalAmount);
  const taxAmount = calculateTaxForTest(subTotalAmount, deliveryFee, address);
  const totalAmount = parseFloat(
    (subTotalAmount + deliveryFee + taxAmount).toFixed(2),
  );

  return { subTotalAmount, deliveryFee, taxAmount, totalAmount, completeOrder };
}

export async function cancelOrder(orderId, user) {
  if (!orderId || isNaN(Number(orderId))) {
    throw new Error("INVALID_ORDER_ID");
  }

  const order = await getOrderById(orderId);
  if (!order) throw new Error("ORDER_NOT_FOUND");
  if (order.user_id !== user.id) throw new Error("FORBIDDEN");
  if (!isWithinCancellationWindow(order.created_at, 7))
    throw new Error("ORDER_NOT_CANCELLABLE");

  if (order.status === "paid") {
    return cancelPaidOrder(orderId);
  }

  if (order.status === "pending") {
    return cancelPendingOrder(orderId);
  }

  throw new Error("ORDER_NOT_CANCELLABLE");
  // 예상하지 않은 order.status가 도착했을 때 조용히 끝내지 않고 에러를 던짐
}

async function cancelPaidOrder(orderId) {
  const payment = await findUniquePaymentByOrderId(orderId);

  if (!payment) throw new Error("PAYMENT_NOT_FOUND");
  if (!payment.stripe_charge_id) throw new Error("CHARGE_NOT_FOUND");
  if (payment.payment_status !== "succeeded")
    throw new Error("PAYMENT_NOT_REFUNDABLE");
  if (!payment.stripe_payment_intent_id)
    throw new Error("PAYMENT_INTENT_NOT_FOUND");

  // amount 생략 시 전액 환불
  const refund = await stripe.refunds.create({
    payment_intent: payment.stripe_payment_intent_id,
  });

  // 카드사에 환불 신호 전송 중이거나 성공일 땐 정상 진행 (pending, succeeded)
  // failed/canceled 만 진짜 실패.
  if (refund.status === "failed" || refund.status === "canceled") {
    throw new Error("REFUND_FAILED");
  }

  const client = await pool.connect();
  try {
    await client.query("BEGIN");
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
      "refund_pending",
      payment.stripe_charge_id,
    );

    if (updatedCount === 0) {
      throw new Error("PAYMENT_STATUS_CONFLICT");
    }

    await updateOrderStatus(client, orderId, "canceled");
    await client.query("COMMIT");
  } catch (err) {
    await client.query("ROLLBACK").catch(() => {});
    console.error("Post-refund DB update failed:", err);
    throw new Error("POST_REFUND_DB_FAILURE");
  } finally {
    client.release();
  }
}

export async function cancelPendingOrder(orderId) {
  const payment = await findUniquePaymentByOrderId(orderId);
  if (!payment) throw new Error("PAYMENT_NOT_FOUND");
  if (!payment.stripe_payment_intent_id)
    throw new Error("PAYMENT_INTENT_NOT_FOUND");
  if (!CANCELLABLE_PAYMENT_STATUSES.includes(payment.payment_status))
    throw new Error("ORDER_NOT_CANCELLABLE");

  try {
    // 미완료 PaymentIntent를 취소
    await stripe.paymentIntents.cancel(payment.stripe_payment_intent_id);
  } catch (stripeErr) {
    // Stripe에 저장된 PaymentIntent를 조회
    const current = await stripe.paymentIntents.retrieve(
      payment.stripe_payment_intent_id,
    );

    // 이미 취소된 PaymentIntent 가 아니라면 에러를 상위로 전달
    if (current.status !== "canceled") {
      throw stripeErr;
    }
  }

  const client = await pool.connect();
  try {
    await client.query("BEGIN");
    await updatePendingPayment(client, orderId, "canceled");
    await updateOrderStatus(client, orderId, "canceled");
    await client.query("COMMIT");
  } catch (err) {
    await client.query("ROLLBACK").catch(() => {});
    console.error("Order cancellation DB update failed:", err);
    throw new Error("POST_DB_FAILURE");
  } finally {
    client.release();
  }
}

export async function expirePendingOrder(orderId) {
  const payment = await findUniquePaymentByOrderId(orderId);
  if (!payment) throw new Error("PAYMENT_NOT_FOUND");
  if (!payment.stripe_payment_intent_id)
    throw new Error("PAYMENT_INTENT_NOT_FOUND");
  if (payment.payment_status !== "requires_payment")
    throw new Error("ORDER_NOT_EXPIRABLE");

  try {
    // 미완료 PaymentIntent를 취소
    await stripe.paymentIntents.cancel(payment.stripe_payment_intent_id);
  } catch (stripeErr) {
    // Stripe에 저장된 PaymentIntent를 조회
    const current = await stripe.paymentIntents.retrieve(
      payment.stripe_payment_intent_id,
    );

    // 결제가 완료됐거나 다른 상태로 넘어감 - 만료 처리하면 안 됨
    if (current.status !== "canceled") {
      throw stripeErr;
    }
  }

  const client = await pool.connect();
  try {
    await client.query("BEGIN");
    await updatePendingPayment(client, orderId, "expired");
    await updateOrderStatus(client, orderId, "expired");
    await client.query("COMMIT");
  } catch (err) {
    await client.query("ROLLBACK").catch(() => {});
    console.error("Order expiration DB update failed:", err);
    throw new Error("POST_DB_FAILURE");
  } finally {
    client.release();
  }
}
