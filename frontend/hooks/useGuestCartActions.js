import { useCallback, useContext } from "react";
import CartContext from "../contexts/CartContext";
import {
  createNextCartAfterAdd,
  createNextCartAfterDecrease,
} from "../utils/calculateCart";

export default function useGuestCartActions() {
  const { items, setItems } = useContext(CartContext);

  const addItemLocally = useCallback(
    (item) => {
      const { nextCart, isNew, nextQty } = createNextCartAfterAdd(items, item);
      setItems(nextCart);

      return { isNew, nextQty };
    },
    [items, setItems],
  );

  const clearCartLocally = useCallback(() => {
    setItems([]);
  }, [items, setItems]);

  const decreaseItemLocally = useCallback(
    (item) => {
      const nextCart = createNextCartAfterDecrease(items, item);
      setItems(nextCart);
    },
    [items, setItems],
  );

  const deleteItemLocally = useCallback(
    (item) => {
      const nextCart = items.filter((i) => i.id !== item.id);
      setItems(nextCart);
    },
    [items, setItems],
  );

  return {
    addItemLocally,
    decreaseItemLocally,
    clearCartLocally,
    deleteItemLocally,
  };
}
