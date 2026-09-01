import { PAYMENT_ERROR } from "../constants/errors.js";
import {
  detachStripePaymentMethod,
  retrieveStripePaymentMethod,
} from "../integrations/stripe/payment-method.js";
import {
  deleteCard,
  findUniqueStripeMethodId,
  userOwnsStripePaymentMethod,
} from "../services/payment.methods-service.js";

export async function getPaymentMethodByStripeId(
  stripePaymentMethodId,
  userId,
) {
  if (!stripePaymentMethodId) {
    throw new Error(PAYMENT_ERROR.INVALID_PAYMENT_METHOD_ID);
  }

  // "이 카드가 저장됐는가 & 저장은 안 됐어도 실제로 쓰였던 카드인가"
  const owns = await userOwnsStripePaymentMethod(stripePaymentMethodId, userId);
  if (!owns) {
    throw new Error(PAYMENT_ERROR.FORBIDDEN);
  }

  const paymentMethod = await retrieveStripePaymentMethod(
    stripePaymentMethodId,
  );

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
