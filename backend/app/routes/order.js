import express from "express";
import {
  createOrderId,
  insertOrderItems,
  saveShippingInfo,
} from "../services/order-service.js";
import { verifyUserAuth } from "../middleware/auth.middleware.js";
import { getMenuPrices } from "../services/menu-service.js";
import { calculateOrderTotal } from "../utils/orderCalculations.js";
import pool from "../config/db.js";

const router = express.Router();

// orderPayload: [{ menu_name, menu_id, qty }, {}]
// 트랜잭션 써야함.
router.post("/initialize-order", verifyUserAuth, async (req, res) => {
  const client = await pool.connect();
  try {
    const { address, orderPayload } = req.body;
    const menuIds = orderPayload.items.map((i) => i.menu_id);
    const itemsWithPrice = await getMenuPrices(client, menuIds); // [{ id, price }, {}]

    // 유저가 존재하지 않는 menu_id를 보냈을 때
    if (itemsWithPrice.length !== menuIds.length) {
      return res
        .status(400)
        .json({ error: "Some items are no longer available." });
    }
    const pricedMap = new Map(
      itemsWithPrice.map((item) => [item.id, item.price]),
    ); // [ [], [] ] 즉, priceMap.get(item.id)은 item.price
    const completeOrder = orderPayload.items.map((orderItem) => ({
      ...orderItem,
      price: pricedMap.get(orderItem.menu_id) ?? null,
    }));
    const totalAmount = calculateOrderTotal(completeOrder);

    await client.query("BEGIN");
    const addressId = await saveShippingInfo(client, req.user.id, address);
    const orderId = await createOrderId(
      client,
      req.user.id,
      addressId,
      totalAmount,
    );
    await insertOrderItems(client, orderId, completeOrder); // [{ menu_name, menu_id, qty, price }, {}]
    await client.query("COMMIT");
    res.status(201).json({ message: "Order info is saved.", orderId });
  } catch (err) {
    await client.query("ROLLBACK");
    console.error("Order error,", err.message);
    res
      .status(500)
      .json({ error: "Something went wrong while placing an order." });
  } finally {
    client.release();
  }
});

export default router;
