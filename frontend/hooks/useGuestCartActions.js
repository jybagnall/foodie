import { useCallback, useContext } from "react";
import CartContext from "../contexts/CartContext";
import {
  createNextCartAfterAdd,
  createNextCartAfterDecrease,
} from "../utils/calculateCart";

export default function useGuestCartActions() {
  const { items, setItems, setSelectedItemIds } = useContext(CartContext);

  const addItem = useCallback(
    (item) => {
      const { nextCart, isNew, nextQty } = createNextCartAfterAdd(items, item);
      setItems(nextCart);
      setSelectedItemIds((prev) => {
        const next = new Set(prev);
        next.add(item.id);
        return next;
      });

      return { isNew, nextQty };
    },
    [items, setSelectedItemIds],
  );

  const clearCart = useCallback(() => {
    setItems([]);
    setSelectedItemIds(new Set());
  }, [setItems]);

  const decreaseItem = useCallback(
    (item) => {
      const nextCart = createNextCartAfterDecrease(items, item);
      setItems(nextCart);
    },
    [items, setItems],
  );

  const deleteItem = useCallback(
    (item) => {
      const nextCart = items.filter((i) => i.id !== item.id);
      setItems(nextCart);
    },
    [items],
  );

  return {
    addItem,
    decreaseItem,
    clearCart,
    deleteItem,
  };
}
