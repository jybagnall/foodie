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
}

export default PaymentService;
