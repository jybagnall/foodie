import { stripe } from "../../config/stripe.js";
import { PAYMENT_ERROR } from "../../constants/errors.js";
import { STRIPE_ERROR_CODE } from "../../constants/stripe.js";

export async function retrieveStripeCharge(latestChargeId) {
  try {
    return await stripe.charges.retrieve(latestChargeId);
  } catch (err) {
    if (err.code === STRIPE_ERROR_CODE.RESOURCE_MISSING) {
      throw new Error(PAYMENT_ERROR.CHARGE_NOT_FOUND, {
        cause: err,
      });
    }

    console.error("Stripe charge retrieve failed", {
      stripeChargeId: latestChargeId,
      type: err.type,
      code: err.code,
    });

    throw new Error(PAYMENT_ERROR.PAYMENT_SERVICE_UNAVAILABLE, {
      cause: err,
    });
  }
}
