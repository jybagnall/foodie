import Client from "./client";

class OrderService {
  constructor(abortController, getAccessToken) {
    this.client = new Client(abortController, getAccessToken);
  }

  async initializeOrder(orderDetails) {
    const data = await this.client.post(
      "/api/orders/initialize-order",
      orderDetails,
    );
    return data;
  }
}

export default OrderService;
