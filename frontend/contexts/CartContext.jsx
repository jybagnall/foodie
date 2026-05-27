import {
  createContext,
  useState,
  useEffect,
  useMemo,
  useCallback,
} from "react";
import { loadCart, saveCart } from "../storage/cartStorage";

// 나중에 Provider가 진짜 함수를 제공할 거야”라는 형태 선언용
const CartContext = createContext({
  items: [],
  setItems: () => {},
  mode: "guest",
  switchToServerMode: () => {},
  totalItemCount: 0,
  checkedItemQty: 0,
  totalAmount: 0,
  toggleCheckedItem: (id) => {},
});

// setItems()가 실행되면 items가 바뀌고 →
// 컴포넌트가 다시 렌더링됨 → 그 안의 함수들도 다시 만들어짐.
// Context를 사용하는 모든 컴포넌트가 리렌더링됨 ⚠️
export function CartContextProvider({ children }) {
  const [items, setItems] = useState(() => loadCart()); // once
  const [mode, setMode] = useState("guest");

  // guest일 때만 localStorage 저장
  useEffect(() => {
    if (mode === "guest") {
      saveCart(items);
    }
  }, [items, mode]);

  const switchToServerMode = useCallback(() => {
    setMode("server");
  }, []);

  const totalItemCount = useMemo(
    () => items.reduce((total, i) => total + i.qty, 0),
    [items],
  );

  const checkedItemQty = useMemo(
    () => items.filter((i) => i.checked).reduce((total, i) => total + i.qty, 0),
    [items],
  );

  const totalAmount = useMemo(
    () =>
      items
        .filter((i) => i.checked)
        .reduce((sum, i) => (sum += i.price * i.qty), 0),
    [items],
  );

  const toggleCheckedItem = useCallback((id) => {
    setItems((prev) =>
      prev.map((i) => (i.id === id ? { ...i, checked: !i.checked } : i)),
    );
  }, []);

  const setAllChecked = useCallback((checked) => {
    setItems((prev) => prev.map((i) => ({ ...i, checked })));
  }, []);

  return (
    <CartContext.Provider
      value={{
        items,
        setItems,
        mode,
        switchToServerMode,
        totalItemCount,
        checkedItemQty,
        totalAmount,
        toggleCheckedItem,
        setAllChecked,
      }}
    >
      {children}
    </CartContext.Provider>
  );
}

export default CartContext;
