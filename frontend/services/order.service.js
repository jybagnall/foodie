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

  async getShippingAddresses() {
    const data = await this.client.get("/api/orders/shipping-addresses");
    return data;
  }
}

export default OrderService;
