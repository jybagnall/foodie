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
  const { items, setItems, selectedItemIds, setSelectedItemIds } =
    useContext(CartContext);
  const { syncCartToServer } = useServerCart();

  const addItemAndSync = useCallback(
    (item) => {
      const prevCart = [...items];
      const prevSelectedItemIds = new Set(selectedItemIds);
      const { nextCart, isNew, nextQty } = createNextCartAfterAdd(items, item);
      setItems(nextCart);

      if (isNew) {
        setSelectedItemIds((prev) => new Set([...prev, item.id]));
      }
      syncCartToServer(createCartSyncPayload(nextCart), {
        onError: () => {
          setItems(prevCart);
          setSelectedItemIds(prevSelectedItemIds);
          toast.error("We couldn't update your cart. Please try again.");
        },
      });

      return { isNew, nextQty };
    },
    [items, selectedItemIds, syncCartToServer],
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
  }, [items, syncCartToServer]);

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
    [items, syncCartToServer],
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
    [items, syncCartToServer],
  );

  const removeOrderedItemsAndSync = useCallback(() => {
    const nextCart = items.filter((i) => !selectedItemIds.has(i.id));
    setItems(nextCart);
    setSelectedItemIds(new Set());
    syncCartToServer(createCartSyncPayload(nextCart));
  }, [items, syncCartToServer, selectedItemIds]);

  const reorderItemsAndSync = useCallback(
    (reorderItems, callbacks = {}) => {
      const prevCart = [...items];
      let nextCart = [...items];
      const newIds = [];
      const prevSelectedItemIds = new Set(selectedItemIds);

      reorderItems.forEach((i) => {
        const { nextCart: updatedCart, isNew } = createNextCartAfterAdd(
          nextCart,
          i,
        );
        nextCart = updatedCart;

        if (isNew) {
          newIds.push(i.id);
        }
      });
      setSelectedItemIds((prev) => new Set([...prev, ...newIds]));
      setItems(nextCart);

      syncCartToServer(createCartSyncPayload(nextCart), {
        onSuccess: () => {
          callbacks.onSuccess?.();
        },
        onError: () => {
          setItems(prevCart);
          setSelectedItemIds(prevSelectedItemIds);
          toast.error("We couldn't update your cart. Please try again.");
        },
      });
    },
    [items, syncCartToServer, selectedItemIds],
  );

  return {
    addItemAndSync,
    decreaseItemAndSync,
    clearCartAndSync,
    deleteItemAndSync,
    removeOrderedItemsAndSync,
    reorderItemsAndSync,
  };
}
