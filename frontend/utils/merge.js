export function mergeCarts(guest, server) {
  const map = new Map();

  [...server, ...guest].forEach((item) => {
    if (!map.has(item.id)) {
      map.set(item.id, { ...item });
    } else {
      map.get(item.id).qty += item.qty;
    }
  });

  return Array.from(map.values()).map((item) => ({
    ...item,
    checked: true,
  }));
}
