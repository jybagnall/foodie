import Client from "./client";

class AddressService {
  constructor(signal, getAccessToken) {
    this.client = new Client(signal, getAccessToken);
  }

  async createAddress(formData) {
    const data = await this.client.post(`/api/addresses/create`, formData);
    return data;
  }

  async deleteAddress(addressId) {
    const data = await this.client.delete(`/api/addresses/delete/${addressId}`);
    return data;
  }

  async editAddress(addressId, formData) {
    const data = await this.client.patch(
      `/api/addresses/edit/${addressId}`,
      formData,
    );
    return data;
  }

  async getAllAddresses() {
    const data = await this.client.get("/api/addresses/all");
    return data;
  }

  async getDefaultAddress() {
    const data = await this.client.get("/api/addresses/default");
    return data;
  }

  async setDefaultAddress(addressId) {
    const data = await this.client.patch(
      `/api/addresses/set-default/${addressId}`,
    );
    return data;
  }
}

export default AddressService;
