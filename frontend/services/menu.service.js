import Client from "./client";

class MenuService {
  constructor(signal, getAccessToken) {
    this.client = new Client(signal, getAccessToken);
  }

  async createMenu(formData) {
    const data = await this.client.post("/api/menu/create-menus", formData);
    return data;
  }

  async getMenus() {
    const data = await this.client.rawGet("/api/menu/get-menus");
    return data;
  }

  async getMenuDetail(id) {
    const data = await this.client.get(`/api/menu/single-menu-detail/${id}`);
    return data;
  }

  async updateImage(menuId, formData) {
    const data = await this.client.patch(`/api/menu/${menuId}/image`, formData);
    return data;
  }

  async updateMenuField(menuId, updatePayload) {
    const data = await this.client.patch(`/api/menu/${menuId}`, updatePayload);
    return data;
  }
}

export default MenuService;
