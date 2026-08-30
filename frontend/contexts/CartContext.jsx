import {
  createContext,
  useState,
  useEffect,
  useMemo,
  useCallback,
} from "react";
import { loadCart, saveGuestCart } from "../storage/cartStorage";
import {
  FREE_DELIVERY_THRESHOLD,
  DEFAULT_DELIVERY_FEE,
} from "../constants/delivery";

// 나중에 Provider가 진짜 함수를 제공할 거야”라는 형태 선언용
const CartContext = createContext({
  items: [],
  setItems: () => {},
  selectedItemIds: new Set(),
  setSelectedItemIds: () => {},
  mode: "guest",
  switchToServerMode: () => {},
  switchToGuestMode: () => {},
  totalItemCount: 0,
  checkedItemQty: 0,
  subTotalAmount: 0,
  deliveryFee: 0,
  totalAmount: 0,
  toggleCheckedItem: () => {},
  toggleAllSelections: () => {},
});

export function CartContextProvider({ children }) {
  const [items, setItems] = useState(() => loadCart()); // once
  const [selectedItemIds, setSelectedItemIds] = useState(() => new Set());
  const [mode, setMode] = useState("guest");

  // guest일 때만 localStorage 저장
  useEffect(() => {
    if (mode === "guest") {
      saveGuestCart(items);
    }
  }, [items, mode]);

  const switchToServerMode = useCallback(() => {
    setMode("server");
  }, []);

  const switchToGuestMode = useCallback(() => {
    setMode("guest");
  }, []);

  const totalItemCount = useMemo(
    () => items.reduce((total, i) => total + i.qty, 0),
    [items],
  );

  const checkedItems = useMemo(
    () => items.filter((i) => selectedItemIds.has(i.id)),
    [items, selectedItemIds],
  );

  const checkedItemQty = useMemo(
    () => checkedItems.reduce((sum, i) => sum + i.qty, 0),
    [checkedItems],
  );

  const subTotalAmount = useMemo(
    () => checkedItems.reduce((sum, i) => sum + i.price * i.qty, 0),
    [checkedItems],
  );

  const deliveryFee =
    subTotalAmount >= FREE_DELIVERY_THRESHOLD ? 0 : DEFAULT_DELIVERY_FEE;

  const totalAmount = subTotalAmount + deliveryFee;

  const toggleCheckedItem = useCallback((id) => {
    setSelectedItemIds((prev) => {
      const next = new Set(prev);

      if (next.has(id)) {
        next.delete(id);
      } else {
        next.add(id);
      }
      return next;
    });
  }, []);

  const toggleAllSelections = useCallback(
    (checked) => {
      setSelectedItemIds(checked ? new Set(items.map((i) => i.id)) : new Set());
    },
    [items],
  );

  const value = useMemo(
    () => ({
      items,
      setItems,
      selectedItemIds,
      setSelectedItemIds,
      mode,
      switchToServerMode,
      switchToGuestMode,
      totalItemCount,
      checkedItemQty,
      subTotalAmount,
      deliveryFee,
      totalAmount,
      toggleCheckedItem,
      toggleAllSelections,
    }),
    [
      items,
      setItems,
      selectedItemIds,
      setSelectedItemIds,
      mode,
      switchToServerMode,
      switchToGuestMode,
      totalItemCount,
      checkedItemQty,
      subTotalAmount,
      deliveryFee,
      totalAmount,
      toggleCheckedItem,
      toggleAllSelections,
    ],
  );

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>;
}

export default CartContext;
