import { updateUserStripeId } from "../services/account-service.js";
import { stripe } from "../config/stripe.js";
import { STRIPE_METADATA_USER_ID } from "../constants/stripe.js";

export async function createStripeCustomerId(createdUser, name, email) {
  let stripeCustomerId = null;

  try {
    const stripeCustomer = await stripe.customers.create({
      name,
      email,
      metadata: { [STRIPE_METADATA_USER_ID]: createdUser.id },
    });

    stripeCustomerId = stripeCustomer.id;
    await updateUserStripeId(createdUser.id, stripeCustomerId);
  } catch (stripeErr) {
    console.error(`Stripe customer creation failed for ${email}:`, stripeErr);
  }
  return stripeCustomerId;
}
