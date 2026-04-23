import Client from "./client";

class PaymentService {
  constructor(signal, getAccessToken) {
    this.client = new Client(signal, getAccessToken);
  }

  async chargeSavedCard(orderId, cardId) {
    const data = await this.client.post("/api/payments/charge-saved-card", {
      orderId,
      cardId,
    });
    return data;
  }

  async createPaymentIntent(paymentIntent) {
    const data = await this.client.post(
      "/api/payments/create-payment-intent",
      paymentIntent,
    );
    return data;
  }

  async findPayment(orderId) {
    const data = await this.client.get(
      `/api/payments/client-secret?order_id=${orderId}`,
    );
    return data;
  }

  async verifyPayment(paymentIntentId) {
    const data = await this.client.get(
      `/api/payments/verify?payment_intent=${paymentIntentId}`,
    );
    return data;
  }
}

export default PaymentService;
