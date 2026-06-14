export function mergeCarts(guest, server) {
  const map = new Map();

  [...server, ...guest].forEach((item) => {
    if (!map.has(item.id)) {
      map.set(item.id, { ...item });
    } else {
      map.get(item.id).qty += item.qty;
    }
  });

  return Array.from(map.values());
}
// 같은 상품은 수량만 더한다
