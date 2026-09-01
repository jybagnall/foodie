import { stripe } from "../../config/stripe.js";
import { PAYMENT_ERROR } from "../../constants/errors.js";
import {
  STRIPE_ERROR_CODE,
  STRIPE_ERROR_TYPE,
  STRIPE_METADATA_USER_ID,
} from "../../constants/stripe.js";

export async function createStripeCustomer(user) {
  try {
    return await stripe.customers.create(
      {
        name: user.name,
        email: user.email,
        metadata: { [STRIPE_METADATA_USER_ID]: String(user.id) },
      },
      { idempotencyKey: `stripe-customer-for-user-${user.id}` },
      // 생성 API가 여러 번 호출되어도 Stripe는 하나만 생성
    );
  } catch (err) {
    console.error("Stripe customer create failed", {
      userId: user.id,
      type: err.type,
      code: err.code,
    });
    throw new Error(PAYMENT_ERROR.PAYMENT_SERVICE_UNAVAILABLE, {
      cause: err,
    });
  }
}

export async function deleteStripeCustomer(customerId) {
  try {
    await stripe.customers.del(customerId);
  } catch (err) {
    if (err.type === STRIPE_ERROR_TYPE.INVALID_REQUEST) {
      console.warn("Stripe customer already deleted or missing", {
        customerId,
        code: err.code,
      });
      return;
    }
    throw err; // 진짜 예상 못한 에러만 호출부로 올림
  }
}

export async function retrieveStripeCustomer(customerId) {
  try {
    // Stripe에 존재하는지 검증
    return await stripe.customers.retrieve(customerId);
  } catch (err) {
    if (err.code === STRIPE_ERROR_CODE.RESOURCE_MISSING) {
      return null; // 없는 아이디
    } else {
      console.error("Stripe customer retrieve failed", {
        customerId,
        type: err.type,
        code: err.code,
      });
      throw new Error(PAYMENT_ERROR.PAYMENT_SERVICE_UNAVAILABLE, {
        cause: err,
      });
    }
  }
}
