import { PAYMENT_ERROR } from "../constants/errors.js";
import {
  DEFAULT_CURRENCY,
  getStripePaymentReturnUrl,
  STRIPE_METADATA_USER_ID,
  STRIPE_METADATA_ORDER_ID,
  STRIPE_RETRY_BASE_DELAY_MS,
  STRIPE_RETRY_MAX_ATTEMPTS,
  toStripeAmount,
  STRIPE_PAYMENT_INTENT_ID_PREFIX,
  STRIPE_PAYMENT_INTENT_STATUS,
  CONFIRMABLE_PAYMENT_STATUSES,
} from "../constants/stripe.js";
import {
  createStripeCustomer,
  retrieveStripeCustomer,
} from "../integrations/stripe/customer.js";
import {
  cancelOrphanedPaymentIntent,
  confirmStripePaymentIntent,
  createStripePaymentIntent,
  retrieveStripePaymentIntent,
  updateStripePaymentIntent,
} from "../integrations/stripe/payment-intent.js";
import { updateUserStripeId } from "../services/account-service.js";
import { getOrderById } from "../services/order-service.js";
import {
  createPaymentRecord,
  findUniquePaymentByOrderId,
} from "../services/payment-service.js";
import { findUniqueStripeMethodId } from "../services/payment.methods-service.js";
import { isValidOrderId } from "../utils/validators.js";

// PaymentIntent 생성 및 DB 저장
async function createAndStoreStripePaymentIntent(
  orderId,
  amount,
  currency,
  customerId,
  userId,
) {
  const paymentIntent = await createStripePaymentIntent({
    amount,
    currency,
    customerId,
    userId,
    orderId,
  });

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

    // cancel 실패 시 PAYMENT_INTENT_CANCELLATION_FAILURE를 던지고 여기서 함수 종료됨 (의도된 동작)
    await cancelOrphanedPaymentIntent(paymentIntent.id);

    throw new Error(PAYMENT_ERROR.POST_PAYMENT_INTENT_DB_FAILURE, {
      cause: dbErr,
    });
  }
}

// Stripe 고객 ID 확인/생성
async function ensureStripeCustomerId(user) {
  let customerId = user.stripe_customer_id;

  if (customerId) {
    const customer = await retrieveStripeCustomer(customerId);

    if (!customer || customer.deleted) {
      customerId = null;
    }
  }

  if (!customerId) {
    const newCustomer = await createStripeCustomer(user);

    try {
      await updateUserStripeIdWithRetry(user.id, newCustomer.id);
      customerId = newCustomer.id;
    } catch (dbErr) {
      console.error(
        `Failed to save stripe customer ${newCustomer.id} for user ${user.id}`,
        dbErr,
      );
      throw new Error(PAYMENT_ERROR.PAYMENT_SERVICE_UNAVAILABLE, {
        cause: dbErr,
      });
    }
  }

  return customerId;
}

async function getValidatedPaymentIntent(orderId, userId) {
  const { amount } = await validateOrderForPayment(orderId, userId);
  const payment = await findUniquePaymentByOrderId(orderId);

  if (!payment?.stripe_payment_intent_id) return { intent: null, amount };

  const intent = await retrieveStripePaymentIntent(
    payment.stripe_payment_intent_id,
  );

  if (intent.amount !== amount) {
    throw new Error(PAYMENT_ERROR.AMOUNT_MISMATCH_WITH_INTENT);
  }

  return { intent, amount };
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
  const methodId = await findUniqueStripeMethodId(cardId, userId);
  if (!methodId) {
    throw new Error(PAYMENT_ERROR.FORBIDDEN);
  } // 카드 검증

  const { intent: existingPaymentIntent } = await getValidatedPaymentIntent(
    orderId,
    userId,
  );

  if (!existingPaymentIntent) {
    throw new Error(PAYMENT_ERROR.PAYMENT_INTENT_NOT_FOUND);
  }
  // payment intent 조회 (결제 요청서가 생성된 상태인가)

  // 이미 succeeded/canceled된 PaymentIntent를 다시 confirm하면 에러임
  if (!CONFIRMABLE_PAYMENT_STATUSES.includes(existingPaymentIntent.status)) {
    throw new Error(PAYMENT_ERROR.INVALID_PAYMENT_STATUS);
  }

  const confirmedPaymentIntent = await confirmStripePaymentIntent({
    paymentIntentId: existingPaymentIntent.id,
    paymentMethodId: methodId,
    returnUrl: getStripePaymentReturnUrl(orderId),
  });

  // 3DS 인증 필요 여부 반환
  if (
    confirmedPaymentIntent.status ===
    STRIPE_PAYMENT_INTENT_STATUS.REQUIRES_ACTION
  ) {
    return {
      requiresAction: true,
      clientSecret: confirmedPaymentIntent.client_secret,
    };
  }

  if (
    confirmedPaymentIntent.status !== STRIPE_PAYMENT_INTENT_STATUS.SUCCEEDED
  ) {
    throw new Error(PAYMENT_ERROR.PAYMENT_FAILED);
  }

  return { paymentIntentId: confirmedPaymentIntent.id };
}

export async function updatePaymentIntentMetadata({
  orderId,
  userId,
  saveCard,
  setAsDefault,
}) {
  const { order } = await validateOrderForPayment(orderId, userId);

  const payment = await findUniquePaymentByOrderId(order.id);
  if (!payment) {
    throw new Error(PAYMENT_ERROR.PAYMENT_NOT_FOUND);
  }

  await updateStripePaymentIntent(payment.stripe_payment_intent_id, {
    saveCard,
    setAsDefault,
  });
}

// "pi_1AbcD..."
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
    paymentIntent = await retrieveStripePaymentIntent(paymentIntentId);
  } catch (err) {
    if (err.message === PAYMENT_ERROR.PAYMENT_INTENT_NOT_FOUND) {
      throw new Error(PAYMENT_ERROR.INVALID_PAYMENT_INTENT, { cause: err });
    }
    throw err; // PAYMENT_SERVICE_UNAVAILABLE 등은 그대로 전파
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
