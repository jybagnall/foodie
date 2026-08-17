import { stripe } from "../../config/stripe.js";

import { PAYMENT_ERROR } from "../../constants/errors.js";
import {
  STRIPE_ERROR_CODE,
  STRIPE_ERROR_TYPE,
  STRIPE_METADATA_ORDER_ID,
  STRIPE_METADATA_SAVE_CARD,
  STRIPE_METADATA_SET_AS_DEFAULT,
  STRIPE_METADATA_USER_ID,
  STRIPE_PAYMENT_INTENT_STATUS,
  SUPPORTED_STRIPE_PAYMENT_METHODS,
} from "../../constants/stripe.js";

export async function cancelOrphanedPaymentIntent(paymentIntentId) {
  try {
    await stripe.paymentIntents.cancel(paymentIntentId);
  } catch (cancelErr) {
    console.error("Stripe paymentIntents.cancel failed", {
      paymentIntentId,
      error: cancelErr.message,
      code: cancelErr.code,
    });

    throw new Error(PAYMENT_ERROR.PAYMENT_INTENT_CANCELLATION_FAILURE, {
      cause: cancelErr,
    });
  }
}

export async function cancelStripePaymentIntent(paymentIntentId) {
  try {
    // 미완료 PaymentIntent를 취소
    await stripe.paymentIntents.cancel(paymentIntentId);
  } catch (stripeErr) {
    // Stripe에 저장된 PaymentIntent를 조회
    const current = await stripe.paymentIntents.retrieve(paymentIntentId);

    // 결제가 완료됐거나 다른 상태로 넘어감 - 만료 처리하면 안 됨
    if (current.status !== STRIPE_PAYMENT_INTENT_STATUS.CANCELED) {
      throw stripeErr;
    }
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

export async function createStripePaymentIntent({
  amount,
  currency,
  customerId,
  userId,
  orderId,
}) {
  try {
    return await stripe.paymentIntents.create(
      {
        amount,
        currency,
        customer: customerId,
        payment_method_types: SUPPORTED_STRIPE_PAYMENT_METHODS,
        metadata: {
          [STRIPE_METADATA_USER_ID]: String(userId),
          [STRIPE_METADATA_ORDER_ID]: String(orderId),
        }, // 주문 & 사용자 연결 (custom data)
      },
      {
        idempotencyKey: `payment-intent-for-order-${orderId}`,
      },
    );
  } catch (err) {
    if (err.type === STRIPE_ERROR_TYPE.IDEMPOTENCY_ERROR) {
      console.error("PaymentIntent idempotency conflict", {
        orderId,
        amount,
      });
      throw new Error(PAYMENT_ERROR.PAYMENT_INTENT_IDEMPOTENCY_CONFLICT, {
        cause: err,
      });
    }
    console.error("Stripe paymentIntents.create failed", {
      orderId,
      type: err.type,
      code: err.code,
    });
    throw new Error(PAYMENT_ERROR.PAYMENT_INTENT_FAILURE, { cause: err });
  }
}

export async function retrieveStripePaymentIntent(paymentIntentId) {
  try {
    return await stripe.paymentIntents.retrieve(paymentIntentId);
  } catch (err) {
    if (err.code === STRIPE_ERROR_CODE.RESOURCE_MISSING) {
      console.error("PaymentIntent not found in Stripe", {
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

export async function updateStripePaymentIntent(
  paymentIntentId,
  { saveCard, setAsDefault },
) {
  try {
    return await stripe.paymentIntents.update(paymentIntentId, {
      metadata: {
        [STRIPE_METADATA_SAVE_CARD]: String(saveCard),
        [STRIPE_METADATA_SET_AS_DEFAULT]: String(setAsDefault),
      },
      ...(saveCard && {
        setup_future_usage: "on_session",
      }),
    });
  } catch (err) {
    console.error("Stripe PaymentIntent update failed", {
      paymentIntentId,
      type: err.type,
      code: err.code,
    });

    throw new Error(PAYMENT_ERROR.PAYMENT_SERVICE_UNAVAILABLE, { cause: err });
  }
}
