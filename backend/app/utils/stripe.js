import { stripe } from "../config/stripe.js";

export async function cancelStripePaymentIntent(paymentIntentId) {
  try {
    // 미완료 PaymentIntent를 취소
    await stripe.paymentIntents.cancel(paymentIntentId);
  } catch (stripeErr) {
    // Stripe에 저장된 PaymentIntent를 조회
    const current = await stripe.paymentIntents.retrieve(paymentIntentId);

    // 결제가 완료됐거나 다른 상태로 넘어감 - 만료 처리하면 안 됨
    if (current.status !== "canceled") {
      throw stripeErr;
    }
  }
}
