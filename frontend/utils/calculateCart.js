export function createCartSyncPayload(items) {
  return {
    items: items.map((i) => ({
      menuId: i.id,
      qty: i.qty,
    })),
  };
}

export function createNextCartAfterAdd(items, item) {
  const targetItem = items.find((i) => i.id === item.id);

  if (targetItem) {
    const nextCart = items.map((i) =>
      i.id === item.id ? { ...i, checked: true, qty: i.qty + 1 } : i,
    );
    return { nextCart, nextQty: targetItem.qty + 1, isNew: false };
  }

  return {
    nextCart: [...items, { ...item, qty: 1, checked: true }],
    nextQty: 1,
    isNew: true,
  };
}

export function createNextCartAfterDecrease(items, item) {
  const targetItem = items.find((i) => i.id === item.id);

  if (!targetItem) return items;

  if (targetItem.qty > 1) {
    return items.map((i) => (i.id === item.id ? { ...i, qty: i.qty - 1 } : i));
  }

  return items.filter((i) => i.id !== item.id);
}
