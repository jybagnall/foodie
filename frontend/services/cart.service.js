import Client from "./client";

class CartService {
  constructor(abortController, authContext) {
    this.client = new Client(abortController, authContext);
  }

  async saveCurrentCart(payload) {
    const data = await this.client.post("/api/carts/save-cart", payload);
    return data;
  }
}

export default CartService;
