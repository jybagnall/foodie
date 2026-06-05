import { useContext, useEffect, useRef } from "react";
import CartContext from "../contexts/CartContext";
import { mergeCarts } from "../utils/merge";
import useServerCart from "./useServerCart";
import { clearCartStorage } from "../storage/cartStorage";

export function useCartMergeOnLogin(accessToken) {
  const { items, setItems, setSelectedItemIds, switchToServerMode } =
    useContext(CartContext);
  const hasInitializedCartRef = useRef(false);
  const {
    serverCartItems,
    syncCartToServer,
    isServerCartReady,
    serverCartFetchingError,
  } = useServerCart();

  useEffect(() => {
    if (!accessToken) return;
    if (!isServerCartReady) return; // 도착한 서버 데이터
    if (serverCartItems == null) return;
    if (serverCartFetchingError) {
      return; // 서버가 불안정한 상태이므로 서버에 저장 안 함
    } // localStorage 에 장바구니 저장 중 (게스트 카트가 유지되고 있음) ❗

    // 로그인 직후에 카트 합치기
    if (!hasInitializedCartRef.current) {
      const guestCartSnapshot = [...items]; // 게스트 아이템 snapshot 저장

      const mergedCart =
        guestCartSnapshot.length > 0
          ? mergeCarts(guestCartSnapshot, serverCartItems)
          : serverCartItems;

      hasInitializedCartRef.current = true;
      switchToServerMode();
      clearCartStorage();
      setItems(mergedCart);
      setSelectedItemIds(new Set(mergedCart.map((i) => i.id)));

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
  }, [serverCartFetchingError, serverCartItems]);
}
