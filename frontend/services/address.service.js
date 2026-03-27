import Client from "./client";

class AddressService {
  constructor(signal, getAccessToken) {
    this.client = new Client(signal, getAccessToken);
  }

  async getAllAddresses() {
    const data = await this.client.get("/api/addresses/all");
    return data;
  }

  async getDefaultAddress() {
    const data = await this.client.get("/api/addresses/default");
    return data;
  }
}

export default AddressService;
