import Stripe from "stripe";
import bcrypt from "bcrypt";
import {
  createAccount,
  updateUserRefreshToken,
  updateUserStripeId,
} from "../services/account-service.js";
import { generateTokens } from "../utils/auth.js";

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);

export async function createUserWithStripe(name, email, password, client) {
  const createdUser = await createAccount(name, email, password, client);

  let stripeCustomer;
  try {
    stripeCustomer = await stripe.customers.create({
      name,
      email,
      metadata: { userId: createdUser.id },
    });
  } catch (stripeErr) {
    const error = new Error("Stripe customer creation failed");
    error.type = "stripe_error";
    throw error;
  }

  await updateUserStripeId(createdUser.id, stripeCustomer.id, client);

  const { accessToken, refreshToken } = generateTokens({
    id: createdUser.id,
    role: createdUser.role,
    name: createdUser.name,
    email: createdUser.email,
    stripe_customer_id: stripeCustomer.id,
  });

  const hashedRefresh = await bcrypt.hash(refreshToken, 10);
  await updateUserRefreshToken(createdUser.id, hashedRefresh, client);

  return {
    accessToken,
    refreshToken,
  };
}
