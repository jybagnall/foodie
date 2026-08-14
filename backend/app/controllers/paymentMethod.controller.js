import { PAYMENT_ERROR } from "../constants/errors.js";
import {
  detachStripePaymentMethod,
  retrieveStripePaymentMethod,
} from "../integrations/stripe/payment-method.js";
import {
  deleteCard,
  findUniqueStripeMethodId,
} from "../services/payment.methods-service.js";

export async function getPaymentMethodByStripeId(stripePaymentMethodId, user) {
  if (!stripePaymentMethodId) {
    throw new Error(PAYMENT_ERROR.INVALID_PAYMENT_METHOD_ID);
  }

  const paymentMethod = await retrieveStripePaymentMethod(
    stripePaymentMethodId,
  );

  if (paymentMethod.customer !== user.stripe_customer_id) {
    throw new Error(PAYMENT_ERROR.FORBIDDEN);
  }

  return paymentMethod;
}

export async function removeCard(cardId, userId) {
  const methodId = await findUniqueStripeMethodId(cardId, userId);

  if (!methodId) {
    throw new Error(PAYMENT_ERROR.CARD_NOT_FOUND);
  }

  await detachStripePaymentMethod(methodId, cardId);
  await deleteCard(cardId, userId);
}
