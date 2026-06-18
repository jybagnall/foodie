import cron from "node-cron";
import { getExpiredPendingOrders } from "../app/services/order-service.js";
import { cancelPendingOrder } from "../app/controllers/order.controller.js";

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
      await cancelPendingOrder(order.id);
    } catch (err) {
      console.error(`Failed to cancel order ${order.id}`, err.message);
    }
  }
}

// 5분 마다
cron.schedule("*/50 * * * *", async () => {
  try {
    await cancelExpiredPayments();
  } catch (err) {
    console.error("Cleanup failed:", err);
  }
});

console.log("Payment cleanup worker started");
