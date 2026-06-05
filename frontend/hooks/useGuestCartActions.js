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
      setSelectedItemIds((prev) => new Set([...prev, item.id]));

      return { isNew, nextQty };
    },
    [items, setSelectedItemIds],
  );

  const clearCart = useCallback(() => {
    setItems([]);
    setSelectedItemIds(new Set());
  }, [setItems, setSelectedItemIds]);

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

      setSelectedItemIds((prev) => {
        const next = new Set(prev);
        next.delete(item.id);
        return next;
      });
    },
    [items, setSelectedItemIds],
  );

  return {
    addItem,
    decreaseItem,
    clearCart,
    deleteItem,
  };
}
