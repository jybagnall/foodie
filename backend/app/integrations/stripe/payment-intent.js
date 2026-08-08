// createStripePaymentIntent()
// cancelStripePaymentIntent()
import { stripe } from "../config/stripe.js";

import { PAYMENT_ERROR } from "../../constants/errors";
import { STRIPE_ERROR_CODE, STRIPE_ERROR_TYPE } from "../../constants/stripe";

export async function retrieveStripePaymentIntent(paymentIntentId) {
  try {
    return await stripe.paymentIntents.retrieve(paymentIntentId);
  } catch (err) {
    if (err.code === STRIPE_ERROR_CODE.RESOURCE_MISSING) {
      console.error("PaymentIntent missing in Stripe but exists in DB", {
        paymentIntentId,
      });
      throw new Error(PAYMENT_ERROR.PAYMENT_INTENT_NOT_FOUND, { cause: err });
    }
    console.error("Stripe paymentIntents.retrieve failed", {
      paymentIntentId,
      type: err.type,
      code: err.code,
    });
    throw new Error(PAYMENT_ERROR.PAYMENT_SERVICE_UNAVAILABLE, { cause: err });
  }
}

export async function confirmStripePaymentIntent({
  paymentIntentId,
  paymentMethodId,
  returnUrl,
}) {
  try {
    return await stripe.paymentIntents.confirm(paymentIntentId, {
      payment_method: paymentMethodId,
      return_url: returnUrl,
    }); // 이미 만들어둔 결제 요청서를 완료 (결제 실행)
  } catch (err) {
    if (err.type === STRIPE_ERROR_TYPE.CARD_ERROR) {
      throw new Error(PAYMENT_ERROR.CARD_DECLINED, {
        cause: err,
      });
    }

    if (err.type === STRIPE_ERROR_TYPE.INVALID_REQUEST) {
      console.error("PaymentIntent confirm rejected", {
        paymentIntentId,
        code: err.code,
      });

      throw new Error(PAYMENT_ERROR.PAYMENT_INTENT_INVALID_STATE, {
        cause: err,
      });
    }

    console.error("Stripe paymentIntents.confirm failed", {
      paymentIntentId,
      type: err.type,
      code: err.code,
    });

    throw new Error(PAYMENT_ERROR.PAYMENT_SERVICE_UNAVAILABLE, {
      cause: err,
    });
  }
}
