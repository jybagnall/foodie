import {
  handlePaymentIntentSucceeded,
  handlePaymentIntentFailed,
} from "./stripe-handlers.js";

export async function handleStripeEvent(client, event) {
  switch (event.type) {
    case "payment_intent.succeeded":
      await handlePaymentIntentSucceeded(client, event.data.object);
      break;
    case "payment_intent.payment_failed":
      await handlePaymentIntentFailed(client, event.data.object);
      break;
    default:
      return { ignored: true };
  }
}
