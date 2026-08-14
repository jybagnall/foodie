import express from "express";
import { getAllOrders, getOrderDetails } from "../services/order-service.js";
import { verifyUserAuth } from "../middleware/auth.middleware.js";
import { validateOrderBody } from "../middleware/validateOrderBody.js";
import {
  cancelOrder,
  initializeOrder,
} from "../controllers/order.controller.js";
import { ORDER_ERROR_STATUS } from "../constants/errors.js";
import { parseCursor } from "../utils/validators.js";

const router = express.Router();

router.get("/my-orders", verifyUserAuth, async (req, res, next) => {
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
    return next(err);
  }
});

router.get("/:orderId", verifyUserAuth, async (req, res, next) => {
  try {
    const { orderId } = req.params;
    const orderInfo = await getOrderDetails(orderId, req.user.id);
    res.status(200).json(orderInfo);
  } catch (err) {
    return next(err);
  }
});

router.post("/:orderId/cancel-order", verifyUserAuth, async (req, res) => {
  try {
    const { orderId } = req.params;
    await cancelOrder(orderId, req.user);
    res.status(200).json({ message: "Order canceled." });
  } catch (err) {
    console.error("Order cancellation failed:", err);
    const status = ORDER_ERROR_STATUS[err.message] ?? 500;
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
    try {
      const { address, orderPayload } = req.body;
      const orderId = await initializeOrder({
        address,
        orderPayload,
        userId: req.user.id,
      });
      res.status(201).json({ message: "Order info is saved.", orderId });
    } catch (err) {
      console.error("Order error,", err);
      const status = ORDER_ERROR_STATUS[err.message] ?? 500;
      return res.status(status).json({
        error: "Failed to initialize order.",
      });
    }
  },
);

export default router;
