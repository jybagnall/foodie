import Stripe from "stripe";

// Stripe API 호출이 30초를 넘으면 예외가 발생
export const stripe = new Stripe(process.env.STRIPE_SECRET_KEY, {
  timeout: 30_000,
});
