import pool from "../config/db.js";
import {
  getCartItemsByUserId,
  saveCurrentCart,
  saveCurrentCartItems,
} from "../services/cart-service.js";
import { withTransaction } from "../utils/db.js";

export async function saveCart(items, userId) {
  await withTransaction(pool, async (client) => {
    const cartId = await saveCurrentCart(client, userId);
    await saveCurrentCartItems(client, cartId, items);
  });

  const updateCartItems = await getCartItemsByUserId(userId);
  return updateCartItems;
}
