import Client from "./client";

class BrandService {
  constructor(signal, getAccessToken) {
    this.client = new Client(signal, getAccessToken);
  }

  async uploadImgAsset(formData) {
    const data = await this.client.post("/api/brand/assets", formData);
    return data;
  }

  async getBrandAssets() {
    const data = await this.client.rawGet("/api/brand/assets");
    return data;
  }
}

export default BrandService;
