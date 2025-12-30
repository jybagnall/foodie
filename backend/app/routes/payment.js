import express from "express";
import {
  createOrderId,
  insertOrderItems,
  saveShippingInfo,
} from "../services/order-service.js";
import { verifyUserAuth } from "../middleware/auth.middleware.js";

const router = express.Router();

router.post("/initialize-order", verifyUserAuth, async (req, res) => {
  try {
    const { address, order } = req.body;
    const addressId = await saveShippingInfo(req.user.id, address);
    const orderId = await createOrderId(
      req.user.id,
      addressId,
      order.total_amount,
    );
    await insertOrderItems(orderId, order);
    res.status(201).json({ message: "Order info is saved.", orderId });
  } catch (err) {
    console.error("Order error,", err.message);
    res
      .status(500)
      .json({ error: "Something went wrong while placing an order." });
  }
});

export default router;
