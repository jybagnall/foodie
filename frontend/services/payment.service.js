import Client from "./client";

class PaymentService {
  constructor(abortController, authContext) {
    this.client = new Client(abortController, authContext);
  }

  async PayForOrder(paymentDetails) {
    const data = await this.client.post(
      "/api/payments/pay-order",
      paymentDetails,
    );
    return data;
  }
}

export default PaymentService;
