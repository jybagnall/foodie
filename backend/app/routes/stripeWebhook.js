import express from "express";
import Stripe from "stripe";
import {
  hasProcessedEvent,
  markEventAsProcessed,
} from "../services/payment-service.js";
import {
  handlePaymentIntentSucceeded,
  handlePaymentIntentFailed,
} from "../services/stripe-service.js";

const router = express.Router();
const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);

// ❗Webhook 에러 재처리 전략
// ❗환불 처리 (charge.refunded), 별도의 테이블이 필요함
// ❗"payment_intent.canceled"
// ❗"payment_intent.processing"

const handlers = {
  "payment_intent.succeeded": handlePaymentIntentSucceeded,
  "payment_intent.payment_failed": handlePaymentIntentFailed,
};

async function handleStripeEvent(event) {
  // 관심 없는 이벤트는 즉시 종료
  if (!handlers[event.type]) return;

  //  이미 처리한 이벤트인지 확인
  if (await hasProcessedEvent(event.id)) return;

  // 우리가 관심 있는 이벤트만 처리
  await handlers[event.type](event.data.object);

  // 이벤트 처리 완료 기록 (중복 방지)
  await markEventAsProcessed(event.id);
}

// POST /api/stripe/webhook
// Webhook 라우트는 성공 / 실패만 Stripe에게 알린다 ?
// constructEvent: Webhook 요청이 진짜 Stripe에서 왔는지 검증하는 용도
// Webhook은 반드시 raw body를 써야 함
// 여기서 보내는 에러는 Stripe 서버가 받음
router.post(
  "/webhook",
  express.raw({ type: "application/json" }),
  async (req, res) => {
    const sig = req.headers["stripe-signature"];

    let event;

    try {
      event = stripe.webhooks.constructEvent(
        req.body,
        sig,
        process.env.STRIPE_WEBHOOK_SECRET,
      );
    } catch (err) {
      console.error("Webhook signature verification failed.", err.message);
      return res.status(400).send(`Webhook Error: ${err.message}`);
    }

    // "중복 방지 + DB 저장" 로직
    try {
      await handleStripeEvent(event);
      res.status(200).end();
    } catch (err) {
      console.error("Webhook handler error:", err);
      res.status(500).send("Webhook handler failed");
    } // throw는 Stripe 재시도를 트리거하기 위한 신호
  },
);

export default router;
