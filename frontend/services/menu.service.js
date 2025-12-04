import Client from "./client";

class MenuService {
  constructor(abortController, authContext) {
    this.client = new Client(abortController, authContext);
  }

  async getMenu() {
    const data = await this.client.post("/api/menu/get-menu");
    return data;
  }
}
