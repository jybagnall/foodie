import { getMenuPrices } from "../services/menu-service";
import { calculateOrderTotal } from "../utils/orderCalculations";

// 1. 메뉴 가격 조회 2. 가격 매핑 3. 총액 계산
export async function buildOrderWithPrices(client, orderPayload) {
  const menuIds = orderPayload.items.map((i) => i.menu_id);
  const itemsWithPrice = await getMenuPrices(client, menuIds); // [{ id, price }, {}]

  // 유저가 존재하지 않는 menu_id를 보냈을 때
  if (itemsWithPrice.length !== menuIds.length) {
    throw new Error("ITEMS_UNAVAILABLE");
  }

  const pricedMap = new Map(
    itemsWithPrice.map((item) => [item.id, item.price]),
  ); // [ [], [] ] 즉, priceMap.get(item.id)은 item.price
  const completeOrder = orderPayload.items.map((orderItem) => ({
    ...orderItem,
    price: pricedMap.get(orderItem.menu_id) ?? null,
  }));
  const totalAmount = calculateOrderTotal(completeOrder);

  return { totalAmount, completeOrder };
}
