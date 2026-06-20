import cron from "node-cron";
import {
  expireOrderWithoutPayment,
  getExpiredPendingOrders,
} from "../app/services/order-service.js";
import { expirePendingOrder } from "../app/controllers/order.controller.js";

async function cancelExpiredPayments() {
  let expiredOrders;

  try {
    expiredOrders = await getExpiredPendingOrders();
  } catch (err) {
    console.error("Failed to fetch expired orders:", err.message);
    return;
  }

  for (const order of expiredOrders) {
    try {
      await expirePendingOrder(order.id);
    } catch (err) {
      if (err.message === "PAYMENT_NOT_FOUND") {
        await expireOrderWithoutPayment(order.id); // 유저가 결제창도 안 띄움
      } else {
        console.error(`Failed to expire order ${order.id}`, err.message);
      }
    }
  }
}

// 50분 마다
cron.schedule("*/50 * * * *", async () => {
  try {
    await cancelExpiredPayments();
  } catch (err) {
    console.error("Cleanup failed:", err);
  }
});

console.log("Payment cleanup worker started");
