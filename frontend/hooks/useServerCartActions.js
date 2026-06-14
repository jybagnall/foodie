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

  const addItem = useCallback(
    (item) => {
      const prevCart = [...items];
      const prevSelectedItemIds = new Set(selectedItemIds);
      const { nextCart, isNew, nextQty } = createNextCartAfterAdd(items, item);
      setItems(nextCart);
      setSelectedItemIds((prev) => {
        const next = new Set(prev);
        next.add(item.id);
        return next;
      });

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

  const clearCart = useCallback(() => {
    const prevCart = [...items];
    const prevSelectedItemIds = new Set(selectedItemIds);

    setItems([]);
    setSelectedItemIds(new Set());

    syncCartToServer(createCartSyncPayload([]), {
      onError: () => {
        setItems(prevCart);
        setSelectedItemIds(prevSelectedItemIds);
        toast.error("We couldn't clear your cart. Please try again.");
      },
    });
  }, [items, syncCartToServer]);

  const decreaseItem = useCallback(
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

  const deleteItem = useCallback(
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
    async (reorderItems) => {
      const prevCart = [...items];
      let nextCart = [...items];
      const reorderedItemIds = [];
      const prevSelectedItemIds = new Set(selectedItemIds);

      reorderItems.forEach((i) => {
        const { nextCart: updatedCart } = createNextCartAfterAdd(nextCart, i);
        nextCart = updatedCart;
        reorderedItemIds.push(i.id);
      });
      setSelectedItemIds((prev) => new Set([...prev, ...reorderedItemIds]));
      setItems(nextCart);
      try {
        await syncCartToServer(createCartSyncPayload(nextCart));
        toast.success("Added to cart!");
      } catch (err) {
        console.error("sync failed", err);
        setItems(prevCart);
        setSelectedItemIds(prevSelectedItemIds);

        toast.error("We couldn't update your cart. Please try again.");
      }
    },
    [items, syncCartToServer, selectedItemIds],
  );

  return {
    addItem,
    decreaseItem,
    clearCart,
    deleteItem,
    removeOrderedItemsAndSync,
    reorderItemsAndSync,
  };
}
