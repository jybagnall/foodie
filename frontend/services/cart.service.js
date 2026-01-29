import Client from "./client";

class CartService {
  constructor(abortController, authContext) {
    this.client = new Client(abortController, authContext);
  }

  async saveCurrentCart(orderDetails) {
    const data = await this.client.post("/api/carts/save-cart", orderDetails);
    return data;
  }
}

export default CartService;
