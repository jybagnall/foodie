import { updateUserStripeId } from "../services/account-service.js";
import { createStripeCustomer } from "../integrations/stripe/customer.js";

export async function createStripeCustomerId(createdUser) {
  try {
    const stripeCustomer = await createStripeCustomer(createdUser);
    await updateUserStripeId(createdUser.id, stripeCustomer.id);

    return stripeCustomer.id;
  } catch (err) {
    console.error(
      `Failed to set up Stripe customer for ${createdUser.email}:`,
      err,
    );
    return null;
  }
}
