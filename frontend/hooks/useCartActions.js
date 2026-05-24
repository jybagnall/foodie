import { useContext, useCallback } from "react";
import useServerCart from "./useServerCart";
import CartContext from "../contexts/CartContext";
import {
  createNextCartAfterAdd,
  createNextCartAfterDecrease,
  createCartSyncPayload,
} from "../utils/calculateCart";

export default function useCartActions() {
  const { items, setItems } = useContext(CartContext);
  const { syncCartToServer } = useServerCart();

  const addItemAndSync = useCallback(
    (item) => {
      const { nextCart, isNew, nextQty } = createNextCartAfterAdd(items, item);
      setItems(nextCart);
      syncCartToServer(createCartSyncPayload(nextCart));

      return { isNew, nextQty };
    },
    [items, setItems, syncCartToServer],
  );

  const decreaseItemAndSync = useCallback(
    (item) => {
      const nextCart = createNextCartAfterDecrease(items, item);
      setItems(nextCart);
      syncCartToServer(createCartSyncPayload(nextCart));
    },
    [items, setItems, syncCartToServer],
  );

  return { addItemAndSync, decreaseItemAndSync };
}
