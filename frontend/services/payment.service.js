import Client from "./client";

class PaymentService {
  constructor(abortController, getAccessToken) {
    this.client = new Client(abortController, getAccessToken);
  }

  async createPaymentIntent(paymentIntent) {
    const data = await this.client.post(
      "/api/payments/create-payment-intent",
      paymentIntent,
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
