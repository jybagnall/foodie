import express from "express";
import {
  getCartItemsByUserId,
  saveCurrentCart,
  saveCurrentCartItems,
} from "../services/cart-service.js";
import { verifyUserAuth } from "../middleware/auth.middleware.js";
import pool from "../config/db.js";

const router = express.Router();

router.get("/get-cart", verifyUserAuth, async (req, res) => {
  try {
    const items = await getCartItemsByUserId(req.user.id);
    res.status(200).json(items);
  } catch (err) {
    console.error("fetching error,", err.message);
    res
      .status(500)
      .json({ error: "Something went wrong while loading the cart." });
  }
});

// [
//   { "menuId": 1, "qty": 2 },
//   { "menuId": 5, "qty": 1 }
// ]

// 서로 다른 커넥션은 서로의 성공/실패를 ‘전혀 모른다’.
router.post("/save-cart", verifyUserAuth, async (req, res) => {
  const { items = [] } = req.body;
  const client = await pool.connect(); // pool (DB 연결 관리자)에서 커넥션을 한개 픽.

  try {
    await client.query("BEGIN"); // 지금부터 여러 DB 작업을 한 묶음으로 취급, 시작한다
    const cartId = await saveCurrentCart(client, req.user.id);
    await saveCurrentCartItems(client, cartId, items);
    await client.query("COMMIT"); // DB 저장 확정, 전부 성공!
    res.status(201).json({ message: "We saved your cart for next time." });
  } catch (err) {
    await client.query("ROLLBACK"); // BEGIN 이후 작업 전부 취소, 전부 실패!
    console.error("Save cart error:", err.message);
    res
      .status(500)
      .json({ error: "Some changes may not be available next time." });
  } finally {
    client.release();
  }
});

export default router;
