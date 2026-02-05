const CART_KEY = "guest_cart";

export function loadCart() {
  try {
    const raw = localStorage.getItem(CART_KEY);
    console.log("📦 loadCart raw:", raw);

    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}

export function saveCart(items) {
  console.log("💾 saveCart:", items);

  localStorage.setItem(CART_KEY, JSON.stringify(items));
}

export function clearCartStorage() {
  localStorage.removeItem(CART_KEY);
}
