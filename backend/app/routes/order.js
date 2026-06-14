import express from "express";
import {
  createOrder,
  getAllOrders,
  getOrderDetails,
  insertOrderItems,
} from "../services/order-service.js";
import { saveShippingInfo } from "../services/address-service.js";
import { verifyUserAuth } from "../middleware/auth.middleware.js";
import pool from "../config/db.js";
import { validateOrderBody } from "../middleware/validateOrderBody.js";
import {
  buildOrderWithPrices,
  cancelOrder,
} from "../controllers/order.controller.js";
import { PAYMENT_ERROR_STATUS } from "../utils/errors.js";
import { parseCursor } from "../utils/validators.js";

const router = express.Router();

router.get("/my-orders", verifyUserAuth, async (req, res) => {
  try {
    const cursor = parseCursor(req.query.cursor); // 다시 객체로 복원함

    if (req.query.cursor && !cursor) {
      return res.status(400).json({
        error: "Invalid cursor",
      }); // 파싱 실패 (잘못된 cursor 가 들어옴)
    }

    const limit = Math.max(
      1,
      Math.min(parseInt(req.query.limit, 10) || 10, 50),
    );
    const { orders, nextCursor } = await getAllOrders(req.user.id, {
      limit,
      cursor,
    });
    res.status(200).json({ orders, nextCursor });
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

router.post("/:orderId/cancel-order", verifyUserAuth, async (req, res) => {
  try {
    const { orderId } = req.params;
    await cancelOrder(orderId, req.user);
    res.status(200).json({ message: "Order canceled." });
  } catch (err) {
    console.error("Order cancellation failed:", err.message);
    const status = PAYMENT_ERROR_STATUS[err.message] ?? 500;
    return res.status(status).json({
      error: "We failed to cancel order. Please try again.",
    });
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
      const {
        subTotalAmount,
        deliveryFee,
        taxAmount,
        totalAmount,
        completeOrder,
      } = await buildOrderWithPrices(client, address, orderPayload);

      const addressId = await saveShippingInfo(client, req.user.id, address);
      const orderId = await createOrder(
        client,
        req.user.id,
        addressId,
        subTotalAmount,
        deliveryFee,
        taxAmount,
        totalAmount,
        address,
      );
      await insertOrderItems(client, orderId, completeOrder);
      // [{ menu_name, menu_id, qty, price }, {}]
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
