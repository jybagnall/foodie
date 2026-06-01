import Stripe from "stripe";

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);

export async function getPaymentMethodByStripeId(stripePaymentMethodId, user) {
  if (!stripePaymentMethodId) {
    throw new Error("INVALID_PAYMENT_METHOD_ID");
  }

  let paymentMethod;

  try {
    paymentMethod = await stripe.paymentMethods.retrieve(stripePaymentMethodId);
  } catch (err) {
    if (err.type == "StripeInvalidRequestError") {
      throw new Error("INVALID_PAYMENT_METHOD_ID");
    }
    err;
  }

  if (paymentMethod.customer !== user.stripe_customer_id) {
    throw new Error("FORBIDDEN");
  }

  return paymentMethod;
}
