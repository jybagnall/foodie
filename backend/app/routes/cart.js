import express from "express";
import { getCartItemsByUserId } from "../services/cart-service.js";
import { verifyUserAuth } from "../middleware/auth.middleware.js";
import { validateCartBody } from "../middleware/validateCartBody.js";
import { saveCart } from "../controllers/cart.controller.js";

const router = express.Router();

router.get("/get-cart", verifyUserAuth, async (req, res) => {
  try {
    const items = await getCartItemsByUserId(req.user.id);
    res.status(200).json(items);
  } catch (err) {
    console.error("fetching error,", err);
    res
      .status(500)
      .json({ error: "Something went wrong while loading the cart." });
  }
});

// req.body:
// [
//   { "menuId": 1, "qty": 2 },
//   { "menuId": 5, "qty": 1 }
// ]

router.post(
  "/save-cart",
  verifyUserAuth,
  validateCartBody,
  async (req, res, next) => {
    try {
      const updateCartItems = await saveCart(req.body, req.user.id);
      res.status(201).json(updateCartItems);
    } catch (err) {
      return next(err);
    }
  },
);

export default router;
