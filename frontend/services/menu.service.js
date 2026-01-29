import Client from "./client";

class MenuService {
  constructor(abortController, authContext) {
    this.client = new Client(abortController, authContext);
  }

  async createMenu(formData) {
    const data = await this.client.post("/api/menu/create-menu", formData);
    return data;
  }

  async getMenu() {
    const data = await this.client.rawGet("/api/menu/get-menu");
    return data;
  }
}

export default MenuService;
