import { stripe } from "../config/stripe.js";
import { PAYMENT_ERROR } from "../constants/errors.js";
import { STRIPE_ERROR_TYPE } from "../constants/stripe.js";

export async function getPaymentMethodByStripeId(stripePaymentMethodId, user) {
  if (!stripePaymentMethodId) {
    throw new Error(PAYMENT_ERROR.INVALID_PAYMENT_METHOD_ID);
  }

  let paymentMethod;

  try {
    paymentMethod = await stripe.paymentMethods.retrieve(stripePaymentMethodId);
  } catch (err) {
    if (err.type == STRIPE_ERROR_TYPE.INVALID_REQUEST) {
      throw new Error(PAYMENT_ERROR.INVALID_PAYMENT_METHOD_ID);
    }
    err;
  }

  if (paymentMethod.customer !== user.stripe_customer_id) {
    throw new Error(PAYMENT_ERROR.FORBIDDEN);
  }

  return paymentMethod;
}
