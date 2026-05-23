import Client from "./client";

class CartService {
  constructor(signal, getAccessToken) {
    this.client = new Client(signal, getAccessToken);
  }

  async getMyCart() {
    const data = await this.client.get("/api/carts/get-cart");
    return data;
  }

  async syncCartToServer(payload) {
    const data = await this.client.post("/api/carts/save-cart", payload);
    return data;
  }
}

export default CartService;
