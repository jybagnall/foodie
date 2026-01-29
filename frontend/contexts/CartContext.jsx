import { createContext, useState, useMemo, useCallback } from "react";

// 나중에 Provider가 진짜 함수를 제공할 거야”라는 형태 선언용
const CartContext = createContext({
  items: [],
  numOfItems: 0,
  numOfCheckedItems: 0,
  totalAmount: 0,
  addItem: (item) => {},
  removeItem: (id) => {},
  clearCart: () => {},
  toggleCheckedItem: (id) => {},
});

// setItems()가 실행되면 items가 바뀌고 →
// 컴포넌트가 다시 렌더링됨 → 그 안의 함수들도 다시 만들어짐.
// Context를 사용하는 모든 컴포넌트가 리렌더링됨 ⚠️
export function CartContextProvider({ children }) {
  const [items, setItems] = useState([]);

  const numOfItems = useMemo(() => items.length, [items]);

  const numOfCheckedItems = useMemo(
    () => items.filter((i) => i.checked).length,
    [items],
  );

  const totalAmount = useMemo(
    () => items.reduce((sum, i) => (sum += i.price * i.amount), 0),
    [items],
  );

  const addItem = useCallback((item) => {
    setItems((prev) => {
      const existingItem = prev.find((i) => i.id === item.id);

      if (existingItem) {
        return prev.map((i) =>
          i.id === item.id ? { ...i, amount: i.amount + 1 } : i,
        );
      }
      return [...prev, { ...item, amount: 1, checked: true }];
    });
  }, []);

  const removeItem = useCallback((id) => {
    setItems((prev) => {
      const existingItem = prev.find((i) => i.id === id);

      if (!existingItem) return prev;

      if (existingItem.amount > 1) {
        return prev.map((i) =>
          i.id === id ? { ...i, amount: i.amount - 1 } : i,
        );
      }

      return prev.filter((item) => item.id !== id);
    });
  }, []);

  const clearCart = useCallback(() => {
    setItems([]);
  }, []);

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
        numOfItems,
        numOfCheckedItems,
        totalAmount,
        addItem,
        removeItem,
        clearCart,
        toggleCheckedItem,
        setAllChecked,
      }}
    >
      {children}
    </CartContext.Provider>
  );
}

export default CartContext;
