import express from "express";
import {
  createOrderId,
  getAllOrders,
  getOrderDetails,
  insertOrderItems,
} from "../services/order-service.js";
import { saveShippingInfo } from "../services/address-service.js";
import { verifyUserAuth } from "../middleware/auth.middleware.js";
import pool from "../config/db.js";
import { validateOrderBody } from "../middleware/validateOrderBody.js";
import { buildOrderWithPrices } from "../controllers/order.controller.js";

const router = express.Router();

router.get("/all", verifyUserAuth, async (req, res) => {
  try {
    const orders = await getAllOrders(req.user.id);
    res.status(200).json(orders);
  } catch (err) {
    console.error("fetching error,", err.message);
    res.status(500).json({ error: err.message });
  }
});

router.get("/:orderId", verifyUserAuth, async (req, res) => {
  try {
    const { orderId } = req.params;
    const orderInfo = await getOrderDetails(orderId, req.user.id);
    res.status(200).json(orderInfo);
  } catch (err) {
    console.error("fetching error,", err.message);
    res.status(500).json({ error: err.message });
  }
});

// orderPayload: [{ menu_name, menu_id, qty }, {}]
// 트랜잭션 써야함.
router.post(
  "/initialize-order",
  verifyUserAuth,
  validateOrderBody,
  async (req, res) => {
    const client = await pool.connect();
    try {
      const { address, orderPayload } = req.body;

      await client.query("BEGIN");
      const { totalAmount, completeOrder } = await buildOrderWithPrices(
        client,
        orderPayload,
      );
      const addressId = await saveShippingInfo(client, req.user.id, address);
      const orderId = await createOrderId(
        client,
        req.user.id,
        addressId,
        totalAmount,
        address,
      );
      await insertOrderItems(client, orderId, completeOrder); // [{ menu_name, menu_id, qty, price }, {}]
      await client.query("COMMIT");
      res.status(201).json({ message: "Order info is saved.", orderId });
    } catch (err) {
      await client.query("ROLLBACK").catch(() => {});
      console.error("Order error,", err.message);

      if (err.message === "ITEMS_UNAVAILABLE") {
        return res
          .status(400)
          .json({ error: "Some items are no longer available." });
      }

      res
        .status(500)
        .json({ error: "Something went wrong while placing an order." });
    } finally {
      client.release();
    }
  },
);

export default router;
