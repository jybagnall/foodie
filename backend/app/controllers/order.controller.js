import Stripe from "stripe";
import pool from "../config/db.js";
import { getMenuPrices } from "../services/menu-service.js";
import { getOrderById, updateOrderStatus } from "../services/order-service.js";
import {
  findUniquePaymentByOrderId,
  updatePaymentStatus,
} from "../services/payment-service.js";
import { calculateOrderTotal } from "../utils/orderCalculations.js";

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);

// 1. 메뉴 가격 조회 2. 가격 매핑 3. 총액 계산
export async function buildOrderWithPrices(client, orderPayload) {
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
  const totalAmount = calculateOrderTotal(completeOrder);

  return { totalAmount, completeOrder };
}

export async function cancelOrderAndRefund(orderId, user) {
  if (!orderId || isNaN(Number(orderId))) {
    throw new Error("INVALID_ORDER_ID");
  }

  const order = await getOrderById(orderId);
  if (!order) throw new Error("ORDER_NOT_FOUND");
  if (order.user_id !== user.id) throw new Error("FORBIDDEN");
  if (order.status !== "paid") throw new Error("ORDER_NOT_CANCELLABLE");

  const payment = await findUniquePaymentByOrderId(orderId);
  if (!payment) throw new Error("PAYMENT_NOT_FOUND");
  if (payment.payment_status !== "succeeded")
    throw new Error("PAYMENT_NOT_REFUNDABLE");

  const refund = await stripe.refunds.create({
    payment_intent: payment.stripe_payment_intent_id,
    // amount 생략 시 전액 환불
  });

  if (refund.status !== "succeeded") throw new Error("REFUND_FAILED");

  const client = await pool.connect();
  try {
    await client.query("BEGIN");
    await updatePaymentStatus(
      client,
      "refunded",
      refund.amount / 100,
      payment.stripe_charge_id,
    );
    await updateOrderStatus(client, orderId, "cancelled");
    await client.query("COMMIT");
  } catch (err) {
    await client.query("ROLLBACK").catch(() => {});
    console.error("Post-refund DB update failed:", err.message);
    throw new Error("POST_REFUND_DB_FAILURE");
  } finally {
    client.release();
  }
}
