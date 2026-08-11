import { stripe } from "../config/stripe.js";
import { PAYMENT_ERROR } from "../../constants/errors.js";
import { DEFAULT_CURRENCY } from "../../constants/stripe.js";

export async function calculateStripeTax({ subTotal, deliveryFee, address }) {
  try {
    return await stripe.tax.calculations.create({
      currency: DEFAULT_CURRENCY,
      line_items: [
        {
          amount: Math.round(subTotal * 100),
          reference: "food_subtotal",
          tax_behavior: "exclusive",
        },
      ],
      shipping_cost: {
        amount: Math.round(deliveryFee * 100),
      },
      customer_details: {
        address: {
          line1: address.street,
          city: address.city,
          state: address.state,
          postal_code: address.postal_code,
        },
        address_source: "shipping",
      },
    });
  } catch (err) {
    console.error("Stripe Tax calculation failed", {
      type: err.type,
      code: err.code,
    });

    throw new Error(PAYMENT_ERROR.PAYMENT_SERVICE_UNAVAILABLE, {
      cause: err,
    });
  }
}
