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
  totalItemCount: 0,
  checkedItemQty: 0,
  subTotalAmount: 0,
  deliveryFee: 0,
  totalAmount: 0,
  toggleCheckedItem: (id) => {},
  toggleAllSelections: () => {},
});

// setItems()가 실행되면 items가 바뀌고 →
// 컴포넌트가 다시 렌더링됨 → 그 안의 함수들도 다시 만들어짐.
// Context를 사용하는 모든 컴포넌트가 리렌더링됨 ⚠️

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

  const checkedItemQty = useMemo(
    () =>
      items
        .filter((i) => selectedItemIds.has(i.id))
        .reduce((sum, i) => (sum += i.qty), 0),
    [items, selectedItemIds],
  );

  const subTotalAmount = useMemo(
    () =>
      items
        .filter((i) => selectedItemIds.has(i.id))
        .reduce((sum, i) => (sum += i.price * i.qty), 0),
    [items, selectedItemIds],
  );

  const deliveryFee = useMemo(
    () =>
      subTotalAmount >= FREE_DELIVERY_THRESHOLD ? 0 : DEFAULT_DELIVERY_FEE,
    [subTotalAmount],
  );

  const totalAmount = useMemo(
    () => subTotalAmount + deliveryFee,
    [subTotalAmount, deliveryFee],
  );

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

  return (
    <CartContext.Provider
      value={{
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
      }}
    >
      {children}
    </CartContext.Provider>
  );
}

export default CartContext;
