import Client from "./client";

class PaymentService {
  constructor(abortController, authContext) {
    this.client = new Client(abortController, authContext);
  }

  async createPaymentIntent(paymentIntent) {
    const data = await this.client.post(
      "/api/payments/create-payment-intent",
      paymentIntent,
    );
    return data;
  }

  async PayForOrder(payDetails) {
    const data = await this.client.post("/api/payments/pay-order", payDetails);
    return data;
  }
}

export default PaymentService;
