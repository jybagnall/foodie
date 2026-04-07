import Client from "./client";

class OrderService {
  constructor(signal, getAccessToken) {
    this.client = new Client(signal, getAccessToken);
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

  async getMyOrders() {
    const data = await this.client.get("/api/orders/all");
    return data;
  }
}

export default OrderService;
