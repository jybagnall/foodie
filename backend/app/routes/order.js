import express from "express";
import {
  createOrderId,
  insertOrderItems,
  saveShippingInfo,
} from "../services/order-service.js";
import { verifyUserAuth } from "../middleware/auth.middleware.js";
import { getMenuPrices } from "../services/menu-service.js";

const router = express.Router();

//  메뉴 아이디가 아니라 이름으로 경고
function calculateOrderTotal(items, itemsWithPrice) {
  return items.reduce((sum, item) => {
    const menu = itemsWithPrice.find((m) => m.id === item.menu_id);
    if (!menu) throw new Error(`Menu ${items.menu_name} not found`);

    return sum + itemsWithPrice.price * item.qty;
  }, 0);
}

// order: { menu_name, menu_id, qty }
// 트랜잭션 써야함.
router.post("/initialize-order", verifyUserAuth, async (req, res) => {
  try {
    const { address, order } = req.body;
    const menuIds = order.items.map((i) => i.menu_id);
    const itemsWithPrice = await getMenuPrices(menuIds); // 이름 { id, price }

    // 유저가 존재하지 않는 menu_id를 보냈을 때
    if (itemsWithPrice.length !== menuIds.length) {
      return res
        .status(400)
        .json({ error: "Some items are no longer available." });
    }
    const totalAmount = calculateOrderTotal(order.items, itemsWithPrice);

    const addressId = await saveShippingInfo(req.user.id, address);
    const orderId = await createOrderId(req.user.id, addressId, totalAmount);
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
