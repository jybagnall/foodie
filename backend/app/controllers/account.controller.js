import { updateUserStripeId } from "../services/account-service.js";
import { stripe } from "../config/stripe.js";

export async function createStripeCustomerId(createdUser, name, email) {
  let stripeCustomerId = null;

  try {
    const stripeCustomer = await stripe.customers.create({
      name,
      email,
      metadata: { userId: createdUser.id },
    });

    stripeCustomerId = stripeCustomer.id;
    await updateUserStripeId(createdUser.id, stripeCustomerId);
  } catch (stripeErr) {
    console.error(`Stripe customer creation failed for ${email}:`, stripeErr);
  }
  return stripeCustomerId;
}
