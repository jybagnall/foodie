import Client from "./client";

class OrderService {
  constructor(signal, getAccessToken) {
    this.client = new Client(signal, getAccessToken);
  }

  async cancelOrder(orderId) {
    const data = await this.client.post(`/api/orders/${orderId}/cancel-order`);
    return data;
  }

  async initializeOrder(orderDetails) {
    const data = await this.client.post(
      "/api/orders/initialize-order",
      orderDetails,
    );
    return data;
  }

  async getMyOrder(orderId) {
    const data = await this.client.get(`/api/orders/${orderId}`);
    return data;
  }

  async getMyOrders({ cursor, limit } = {}) {
    const params = new URLSearchParams({ limit: String(limit) });

    if (cursor != null) params.set("cursor", JSON.stringify(cursor));

    const data = await this.client.get(`/api/orders/my-orders?${params}`);
    return data;
  }
}

export default OrderService;
