import { stripe } from "../config/stripe.js";
import { PAYMENT_ERROR } from "../constants/errors.js";
import {
  DEFAULT_CURRENCY,
  getStripePaymentReturnUrl,
  STRIPE_METADATA_USER_ID,
  STRIPE_METADATA_ORDER_ID,
  STRIPE_RETRY_BASE_DELAY_MS,
  STRIPE_RETRY_MAX_ATTEMPTS,
  SUPPORTED_STRIPE_PAYMENT_METHODS,
  toStripeAmount,
  STRIPE_PAYMENT_INTENT_ID_PREFIX,
  STRIPE_ERROR_CODE,
  STRIPE_ERROR_TYPE,
  STRIPE_PAYMENT_INTENT_STATUS,
  CONFIRMABLE_PAYMENT_STATUSES,
} from "../constants/stripe.js";
import { updateUserStripeId } from "../services/account-service.js";
import { getOrderById } from "../services/order-service.js";
import {
  createPaymentRecord,
  findUniquePaymentByOrderId,
} from "../services/payment-service.js";
import { identifyCardByUserId } from "../services/payment.methods-service.js";
import { isValidOrderId } from "../utils/validators.js";

// PaymentIntent 생성 및 DB 저장
async function createAndStoreStripePaymentIntent(
  orderId,
  amount,
  currency,
  customerId,
  userId,
) {
  const paymentIntent = await stripe.paymentIntents.create(
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

  if (!paymentIntent || !paymentIntent.client_secret) {
    console.error("Stripe PaymentIntent failed:", paymentIntent);
    throw new Error(PAYMENT_ERROR.PAYMENT_INTENT_FAILURE);
  }

  try {
    await createPaymentRecord(orderId, paymentIntent.id, amount, currency);
    return paymentIntent.client_secret;
  } catch (dbErr) {
    console.error("DB insert failed after PaymentIntent creation", {
      paymentIntentId: paymentIntent.id,
      orderId,
      error: dbErr.message,
    });

    try {
      await stripe.paymentIntents.cancel(paymentIntent.id);
    } catch (cancelErr) {
      console.error("Failed to cancel orphaned PaymentIntent", {
        paymentIntentId: paymentIntent.id,
        error: cancelErr.message,
      });
      throw new Error(PAYMENT_ERROR.PAYMENT_INTENT_CANCELLATION_FAILURE);
    }
    throw new Error(PAYMENT_ERROR.POST_PAYMENT_INTENT_DB_FAILURE);
  }
}

async function updateUserStripeIdWithRetry(
  userId,
  stripeCustomerId,
  attempts = STRIPE_RETRY_MAX_ATTEMPTS,
) {
  for (let i = 0; i < attempts; i++) {
    try {
      return await updateUserStripeId(userId, stripeCustomerId);
    } catch (err) {
      if (i === attempts - 1) throw err;
      await new Promise((resolve) =>
        setTimeout(resolve, STRIPE_RETRY_BASE_DELAY_MS * (i + 1)),
      );
    }
  }
}

// Stripe 고객 ID 확인/생성
async function ensureStripeCustomerId(user) {
  let customerId = user.stripe_customer_id;

  if (customerId) {
    try {
      // Stripe에 존재하는지 검증
      const customer = await stripe.customers.retrieve(customerId);

      if (customer.deleted) {
        customerId = null;
      }
    } catch (err) {
      if (err.code === STRIPE_ERROR_CODE.RESOURCE_MISSING) {
        customerId = null; // 없는 아이디
      } else {
        console.error("Stripe customer retrieve failed", {
          userId: user.id,
          customerId,
          code: err.code,
        });
        throw new Error(PAYMENT_ERROR.PAYMENT_SERVICE_UNAVAILABLE);
      }
    }
  }

  if (!customerId) {
    const newCustomer = await stripe.customers.create(
      {
        name: user.name,
        email: user.email,
        metadata: { [STRIPE_METADATA_USER_ID]: String(user.id) },
      },
      { idempotencyKey: `stripe-customer-for-user-${user.id}` },
      // 생성 API가 여러 번 호출되어도 Stripe는 하나만 생성
    );

    try {
      await updateUserStripeIdWithRetry(user.id, newCustomer.id);
      customerId = newCustomer.id;
    } catch (dbErr) {
      console.error(
        `Failed to save stripe customer ${newCustomer.id} for user ${user.id}`,
        dbErr,
      );
      throw new Error(PAYMENT_ERROR.PAYMENT_SERVICE_UNAVAILABLE);
    }
  }

  return customerId;
}

async function validateOrderForPayment(orderId, userId) {
  if (!isValidOrderId(orderId)) {
    throw new Error(PAYMENT_ERROR.INVALID_ORDER_ID);
  }

  const order = await getOrderById(orderId); // 주문 검증

  if (!order) {
    throw new Error(PAYMENT_ERROR.ORDER_NOT_FOUND);
  }

  if (order.user_id !== userId) throw new Error(PAYMENT_ERROR.FORBIDDEN);

  if (order.total_amount <= 0) {
    throw new Error(PAYMENT_ERROR.INVALID_AMOUNT);
  }

  const amount = toStripeAmount(order.total_amount);
  return { order, amount };
}

async function getValidatedPaymentIntent(orderId, userId) {
  const { amount } = await validateOrderForPayment(orderId, userId);
  const payment = await findUniquePaymentByOrderId(orderId);

  if (!payment?.stripe_payment_intent_id) return { intent: null, amount };

  const intent = await stripe.paymentIntents.retrieve(
    payment.stripe_payment_intent_id,
  );

  if (intent.amount !== amount) {
    throw new Error(PAYMENT_ERROR.AMOUNT_MISMATCH_WITH_INTENT);
  }

  return { intent, amount };
}

export async function getExistingClientSecret(orderId, user) {
  const { intent } = await getValidatedPaymentIntent(orderId, user.id);
  if (!intent) throw new Error(PAYMENT_ERROR.PAYMENT_NOT_FOUND);

  return { clientSecret: intent.client_secret };
}

export async function getOrCreateClientSecret(orderId, user) {
  const currency = DEFAULT_CURRENCY;

  const { intent, amount } = await getValidatedPaymentIntent(orderId, user.id);

  if (intent) {
    return { clientSecret: intent.client_secret };
  }

  const customerId = await ensureStripeCustomerId(user);
  const clientSecret = await createAndStoreStripePaymentIntent(
    orderId,
    amount,
    currency,
    customerId,
    user.id,
  );

  return { clientSecret };
}

export async function processSavedCardPayment(orderId, cardId, userId) {
  await validateOrderForPayment(orderId, userId);

  const card = await identifyCardByUserId(cardId, userId);
  if (!card) {
    throw new Error(PAYMENT_ERROR.FORBIDDEN);
  } // 카드 검증

  const payment = await findUniquePaymentByOrderId(orderId);

  // if (!payment) {
  //   throw new Error(PAYMENT_ERROR.PAYMENT_NOT_FOUND);
  // }
  // payment intent 조회 (결제 요청서가 생성된 상태인가)

  // 이미 succeeded/canceled된 PaymentIntent를 다시 confirm하면 에러임
  const intent = await stripe.paymentIntents.retrieve(
    payment.stripe_payment_intent_id,
  );

  if (!CONFIRMABLE_PAYMENT_STATUSES.includes(intent.status)) {
    throw new Error(PAYMENT_ERROR.INVALID_PAYMENT_STATUS);
  }

  const paymentIntent = await stripe.paymentIntents.confirm(intent.id, {
    payment_method: card.stripe_payment_method_id,
    return_url: getStripePaymentReturnUrl(orderId),
  }); // 이미 만들어둔 결제 요청서를 완료 (결제 실행)

  // 3DS 인증 필요 여부 반환
  if (paymentIntent.status === STRIPE_PAYMENT_INTENT_STATUS.requiresAction) {
    return { requiresAction: true, clientSecret: paymentIntent.client_secret };
  }

  if (paymentIntent.status !== "succeeded") {
    throw new Error(PAYMENT_ERROR.PAYMENT_FAILED);
  }

  return { paymentIntentId: paymentIntent.id };
}

// "pi_3AbcD..."
export async function verifyStripePayment(paymentIntentId, orderId, user) {
  if (
    !paymentIntentId ||
    typeof paymentIntentId !== "string" ||
    !paymentIntentId.startsWith(STRIPE_PAYMENT_INTENT_ID_PREFIX)
  ) {
    throw new Error(PAYMENT_ERROR.INVALID_PAYMENT_INTENT);
  } // suspicious/bad request

  let paymentIntent;
  try {
    paymentIntent = await stripe.paymentIntents.retrieve(paymentIntentId);
  } catch (err) {
    if (err.type === STRIPE_ERROR_TYPE.INVALID_REQUEST) {
      throw new Error(PAYMENT_ERROR.INVALID_PAYMENT_INTENT);
    } // invalid payment intent ID
    throw err;
  }

  if (
    paymentIntent.metadata[STRIPE_METADATA_USER_ID] !== String(user.id) ||
    paymentIntent.metadata[STRIPE_METADATA_ORDER_ID] !== String(orderId)
  ) {
    throw new Error(PAYMENT_ERROR.INVALID_PAYMENT_INTENT);
  }

  return {
    paymentIntentStatus: paymentIntent.status,
    lastPaymentError: paymentIntent.last_payment_error?.message,
  };
}
