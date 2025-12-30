import Client from "./client";

class OrderService {
  constructor(abortController, authContext) {
    this.client = new Client(abortController, authContext);
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
