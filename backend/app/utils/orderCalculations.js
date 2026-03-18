export function calculateOrderTotal(order) {
  return order.reduce((sum, item) => sum + item.price * item.qty, 0);
}
