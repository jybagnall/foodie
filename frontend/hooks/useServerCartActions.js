import toast from "react-hot-toast";
import { useCallback, useContext } from "react";
import CartContext from "../contexts/CartContext";
import useServerCart from "./useServerCart";
import {
  createCartSyncPayload,
  createNextCartAfterAdd,
  createNextCartAfterDecrease,
} from "../utils/calculateCart";

export default function useServerCartActions() {
  const { items, setItems } = useContext(CartContext);
  const { syncCartToServer } = useServerCart();

  const addItemAndSync = useCallback(
    (item) => {
      const prevCart = [...items];
      const { nextCart, isNew, nextQty } = createNextCartAfterAdd(items, item);
      setItems(nextCart);

      syncCartToServer(createCartSyncPayload(nextCart), {
        onError: () => {
          setItems(prevCart);
          toast.error("We couldn't update your cart. Please try again.");
        },
      });

      return { isNew, nextQty };
    },
    [items, setItems, syncCartToServer],
  );

  const clearCartAndSync = useCallback(() => {
    const prevCart = [...items];
    setItems([]);

    syncCartToServer(createCartSyncPayload([]), {
      onError: () => {
        setItems(prevCart);
        toast.error("We couldn't clear your cart. Please try again.");
      },
    });
  }, [items, setItems, syncCartToServer]);

  const decreaseItemAndSync = useCallback(
    (item) => {
      const prevCart = [...items];
      const nextCart = createNextCartAfterDecrease(items, item);
      setItems(nextCart);

      syncCartToServer(createCartSyncPayload(nextCart), {
        onError: () => {
          setItems(prevCart);
          toast.error("We couldn't update your cart. Please try again.");
        },
      });
    },
    [items, setItems, syncCartToServer],
  );

  const deleteItemAndSync = useCallback(
    (item) => {
      const prevCart = [...items];
      const nextCart = items.filter((i) => i.id !== item.id);
      setItems(nextCart);

      syncCartToServer(createCartSyncPayload(nextCart), {
        onError: () => {
          setItems(prevCart);
          toast.error("We couldn't delete item. Please try again.");
        },
      });
    },
    [items, setItems, syncCartToServer],
  );

  const removeOrderedItemsAndSync = useCallback(() => {
    const nextCart = items.filter((i) => !i.checked);
    setItems(nextCart);
    syncCartToServer(createCartSyncPayload(nextCart));
  }, [items, setItems, syncCartToServer]);

  return {
    addItemAndSync,
    decreaseItemAndSync,
    clearCartAndSync,
    deleteItemAndSync,
    removeOrderedItemsAndSync,
  };
}
