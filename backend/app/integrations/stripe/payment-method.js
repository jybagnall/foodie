import { stripe } from "../config/stripe.js";
import { PAYMENT_ERROR } from "../../constants/errors.js";
import {
  STRIPE_ERROR_CODE,
  STRIPE_ERROR_TYPE,
} from "../../constants/stripe.js";

export async function detachStripePaymentMethod(methodId, cardId) {
  try {
    await stripe.paymentMethods.detach(methodId, {
      idempotencyKey: `detach-card-${cardId}`,
    }); // 결제 완료된 카드만 삭제됨
  } catch (err) {
    if (err.code === STRIPE_ERROR_CODE.RESOURCE_MISSING) {
      return; // resource_missing: 이미 카드가 detach된 경우
    }

    throw new Error(PAYMENT_ERROR.PAYMENT_SERVICE_UNAVAILABLE, {
      cause: err,
    });
  }
}

export async function retrieveStripePaymentMethod(stripePaymentMethodId) {
  try {
    return await stripe.paymentMethods.retrieve(stripePaymentMethodId);
  } catch (err) {
    if (err.type === STRIPE_ERROR_TYPE.INVALID_REQUEST) {
      throw new Error(PAYMENT_ERROR.INVALID_PAYMENT_METHOD_ID, {
        cause: err,
      });
    }

    throw new Error(PAYMENT_ERROR.PAYMENT_SERVICE_UNAVAILABLE, {
      cause: err,
    });
  }
}
