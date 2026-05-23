import { useContext, useEffect, useRef } from "react";
import CartContext from "../contexts/CartContext";
import { mergeCarts } from "../utils/merge";
import useServerCart from "./useServerCart";
import { clearCartStorage } from "../storage/cartStorage";

export function useCartMergeOnLogin(accessToken) {
  const cartContext = useContext(CartContext);
  const hasInitializedCartRef = useRef(false);
  const {
    serverCartItems,
    syncCartToServer,
    isFetchingServerCart,
    serverCartFetchingError,
  } = useServerCart(accessToken);

  useEffect(() => {
    if (!accessToken) return;
    if (isFetchingServerCart) return;

    if (serverCartFetchingError) {
      return; // 서버가 불안정한 상태이므로 서버에 저장 안 함
    } // localStorage 에 장바구니 저장 중 (게스트 카트가 유지되고 있음) ❗

    // 로그인 직후에 카트 합치기
    if (!hasInitializedCartRef.current) {
      hasInitializedCartRef.current = true;
      const guestCartSnapshot = [...cartContext.items]; // 게스트 아이템 snapshot 저장

      const normalizedServerItems = (serverCartItems ?? []).map((i) => ({
        ...i,
        checked: true,
      }));

      const mergedCart =
        guestCartSnapshot.length > 0
          ? mergeCarts(guestCartSnapshot, normalizedServerItems)
          : normalizedServerItems;

      cartContext.switchToServerMode();
      clearCartStorage();
      cartContext.setItems(mergedCart);

      if (guestCartSnapshot.length > 0) {
        syncCartToServer({
          items: mergedCart.map((i) => ({
            menuId: i.id,
            qty: i.qty,
          })),
        });
      }
      return;
    }
  }, [isFetchingServerCart, serverCartFetchingError, serverCartItems]);
}
