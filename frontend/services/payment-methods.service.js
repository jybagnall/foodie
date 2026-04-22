import Client from "./client";

class PaymentMethodsService {
  constructor(signal, getAccessToken) {
    this.client = new Client(signal, getAccessToken);
  }

  async addPaymentMethod(paymentMethodId) {
    const data = await this.client.post(`/api/payment-methods`, {
      paymentMethodId,
    });
    return data;
  }

  async deletePaymentMethod(id) {
    const data = await this.client.delete(`/api/payment-methods/${id}`);
    return data;
  }

  async getSavedCards() {
    const data = await this.client.get("/api/payment-methods");
    return data;
  }

  async setAsDefaultPaymentMethod(id) {
    const data = await this.client.patch(`/api/payment-methods/${id}/default`);
    return data;
  }
}

export default PaymentMethodsService;
