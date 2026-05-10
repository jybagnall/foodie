import Client from "./client";

class PaymentMethodsService {
  constructor(signal, getAccessToken) {
    this.client = new Client(signal, getAccessToken);
  }

  async deletePaymentMethod(id) {
    const data = await this.client.delete(`/api/payment-methods/delete/${id}`);
    return data;
  }

  async getSavedCards() {
    const data = await this.client.get("/api/payment-methods");
    return data;
  }
}

export default PaymentMethodsService;
