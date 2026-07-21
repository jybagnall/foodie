import Stripe from "stripe";
import { updateUserStripeId } from "../services/account-service.js";

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);

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
