import { stripe } from "../config/stripe.js";
import { ORDER_ERROR } from "../../constants/errors.js";
import { STRIPE_ERROR_TYPE } from "../../constants/stripe.js";

export async function createStripeRefund(paymentIntentId, orderId) {
  try {
    return await stripe.refunds.create(
      {
        payment_intent: paymentIntentId,
      },
      {
        idempotencyKey: `refund-for-order-${orderId}`,
      },
    );
  } catch (err) {
    if (err.type === STRIPE_ERROR_TYPE.IDEMPOTENCY_ERROR) {
      console.error("Refund idempotency conflict", {
        orderId,
        paymentIntentId,
      });
      throw new Error(ORDER_ERROR.REFUND_IDEMPOTENCY_CONFLICT, { cause: err });
    }

    console.error("Stripe refunds.create failed", {
      orderId,
      paymentIntentId,
      type: err.type,
      code: err.code,
    });

    throw new Error(ORDER_ERROR.REFUND_FAILED, { cause: err });
  }
}
