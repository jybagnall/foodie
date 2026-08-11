import { PAYMENT_ERROR } from "../constants/errors.js";
import { retrieveStripePaymentMethod } from "../integrations/stripe/payment-method.js";

export async function getPaymentMethodByStripeId(stripePaymentMethodId, user) {
  if (!stripePaymentMethodId) {
    throw new Error(PAYMENT_ERROR.INVALID_PAYMENT_METHOD_ID);
  }

  const paymentMethod = await retrieveStripePaymentMethod(
    stripePaymentMethodId,
  );

  if (paymentMethod.customer !== user.stripe_customer_id) {
    throw new Error(PAYMENT_ERROR.FORBIDDEN);
  }

  return paymentMethod;
}
