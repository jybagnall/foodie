import { createContext, useState, useMemo, useCallback } from "react";

// 나중에 Provider가 진짜 함수를 제공할 거야”라는 형태 선언용
const CartContext = createContext({
  items: [],
  uniqueMenuCount: 0,
  numOfCheckedItems: 0,
  totalAmount: 0,
  addItem: (item) => {},
  clearCart: () => {},
  decreaseItem: (id) => {},
  deleteItem: (id) => {},
  toggleCheckedItem: (id) => {},
});

// setItems()가 실행되면 items가 바뀌고 →
// 컴포넌트가 다시 렌더링됨 → 그 안의 함수들도 다시 만들어짐.
// Context를 사용하는 모든 컴포넌트가 리렌더링됨 ⚠️
export function CartContextProvider({ children }) {
  const [items, setItems] = useState([]);

  const uniqueMenuCount = useMemo(() => items.length, [items]);

  const numOfCheckedItems = useMemo(
    () => items.filter((i) => i.checked).length,
    [items],
  );

  const totalAmount = useMemo(
    () =>
      items
        .filter((i) => i.checked)
        .reduce((sum, i) => (sum += i.price * i.qty), 0),
    [items],
  );

  // setItems 안에서 값이 바뀌어야 하므로 let을 씀
  const addItem = useCallback((item) => {
    let isNew = true;
    let nextQty = 1;

    setItems((prev) => {
      const existingItem = prev.find((i) => i.id === item.id);

      if (existingItem) {
        isNew = false;
        nextQty = existingItem.qty + 1;

        return prev.map((i) =>
          i.id === item.id ? { ...i, qty: i.qty + 1, checked: true } : i,
        );
      }
      return [...prev, { ...item, qty: 1, checked: true }];
    });

    return { isNew, nextQty };
  }, []);

  const clearCart = useCallback(() => {
    setItems([]);
  }, []);

  const decreaseItem = useCallback((id) => {
    setItems((prev) => {
      const existingItem = prev.find((i) => i.id === id);
      if (!existingItem) return prev;
      if (existingItem.qty > 1) {
        return prev.map((i) => (i.id === id ? { ...i, qty: i.qty - 1 } : i));
      }

      return prev;
    });
  }, []);

  const deleteItem = useCallback((id) => {
    setItems((prev) => prev.filter((item) => item.id !== id));
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
        uniqueMenuCount,
        numOfCheckedItems,
        totalAmount,
        addItem,
        clearCart,
        decreaseItem,
        deleteItem,
        toggleCheckedItem,
        setAllChecked,
      }}
    >
      {children}
    </CartContext.Provider>
  );
}

export default CartContext;
