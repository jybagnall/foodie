export function buildOrderDetails(shippingInfo, items) {
  return {
    address: {
      full_name: shippingInfo.full_name.trim(),
      street: shippingInfo.street.trim(),
      city: shippingInfo.city.trim(),
      postal_code: String(shippingInfo.postal_code).trim(),
      phone: shippingInfo.phone.trim(),
      is_default: shippingInfo.is_default,
    },
    orderPayload: {
      items: items.map((i) => ({
        menu_name: i.name,
        menu_id: i.id,
        qty: i.qty,
      })),
    },
  };
}
