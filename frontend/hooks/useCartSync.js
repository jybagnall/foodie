import { useContext, useEffect, useRef } from "react";
import CartContext from "../contexts/CartContext";
import CartService from "../services/cart.service";
import { mergeCarts } from "../utils/merge";
import { clearCartStorage } from "../storage/cartStorage";

export function useCartSync(accessToken) {
  const cartContext = useContext(CartContext);
  const hasFetchedCartRef = useRef(false);
  const guestItemsRef = useRef([]);

  useEffect(() => {
    if (!accessToken) {
      hasFetchedCartRef.current = false; // 로그아웃 대응
      return;
    }
    if (hasFetchedCartRef.current) return;

    hasFetchedCartRef.current = true;
    guestItemsRef.current = cartContext.items;
    cartContext.switchToServerMode();

    const abortController = new AbortController();
    const cartService = new CartService(
      abortController.signal,
      () => accessToken,
    );

    const fetchCartAndSync = async () => {
      try {
        const serverCartItems = await cartService.getMyCart();

        const finalCart =
          hasFetchedCartRef.current.length > 0
            ? mergeCarts(hasFetchedCartRef.current, serverCartItems)
            : serverCartItems;

        cartContext.setItems(finalCart);
        clearCartStorage();
      } catch (err) {
        console.error("Failed to fetch & sync cart", err);
      }
    };

    fetchCartAndSync();

    return () => abortController.abort();
  }, [accessToken]);
}
