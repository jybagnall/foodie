import { useContext, useEffect, useRef } from "react";
import CartContext from "../contexts/CartContext";
import CartService from "../services/cart.service";
import { mergeCarts } from "../utils/merge";
import { clearCartStorage } from "../storage/cartStorage";

export function useCartSync(accessToken) {
  const cartContext = useContext(CartContext);
  const hasFetchedCartRef = useRef(false);
  const guestItemsRef = useRef([]);
  const abortControllerRef = useRef(null);

  useEffect(() => {
    if (!accessToken) {
      hasFetchedCartRef.current = false; // 로그아웃 대응
      return;
    }
    if (hasFetchedCartRef.current) return;

    hasFetchedCartRef.current = true;
    guestItemsRef.current = cartContext.items; // 게스트 아이템 저장
    cartContext.switchToServerMode();

    abortControllerRef.current?.abort();
    abortControllerRef.current = new AbortController();

    const cartService = new CartService(
      abortControllerRef.current.signal,
      () => accessToken,
    );

    const fetchCartAndSync = async () => {
      try {
        const serverCartItems = await cartService.getMyCart();

        const finalCart =
          guestItemsRef.current.length > 0
            ? mergeCarts(guestItemsRef.current, serverCartItems)
            : serverCartItems;

        cartContext.setItems(finalCart);
        clearCartStorage();
      } catch (err) {
        console.error("Failed to fetch & sync cart", err);
      }
    };

    fetchCartAndSync();

    return () => abortControllerRef.current?.abort();
  }, [accessToken]);
}
