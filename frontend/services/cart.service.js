import Client from "./client";

class CartService {
  constructor(abortController, getAccessToken) {
    this.client = new Client(abortController, getAccessToken);
  }

  async saveCurrentCart(payload) {
    const data = await this.client.post("/api/carts/save-cart", payload);
    return data;
  }
}

export default CartService;
