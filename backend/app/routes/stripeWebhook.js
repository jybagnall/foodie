import express from "express";
import Stripe from "stripe";
import pool from "../config/db.js";

// ❗Webhook 에러 알림 받기
// ❗Webhook이 아예 실패했을 가능성 대비해서 물어볼 수 있음:
// stripe.paymentIntents.retrieve(paymentIntentId)
// ❗환불 처리 (charge.refunded), 별도의 테이블이 필요함
// ❗"payment_intent.canceled"
// ❗"payment_intent.processing"

const router = express.Router();
const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);

// POST /api/stripe/webhook
// 결제 완료 후, Stripe가 Webhook URL 호출함.

const HANDLED_EVENTS = [
  "payment_intent.succeeded",
  "payment_intent.payment_failed",
];

// Stripe가 카드사와 통신 후 결제를 처리하고 나면, 서버에 결과를 알림
export const stripeWebhookHandler = async (req, res) => {
  const sig = req.headers["stripe-signature"];
  let event;

  // Webhook 요청이 Stripe에서 왔는지 검증 & 안전한 event 객체로 만듬.
  try {
    event = stripe.webhooks.constructEvent(
      req.body,
      sig,
      process.env.STRIPE_WEBHOOK_SECRET,
    );
  } catch (err) {
    console.error("Webhook signature verification failed.", {
      type: err?.type,
      message: err?.message,
      requestId: err?.requestId,
    });
    return res.status(400).end();
  }

  // 결제 성공, 실패 이벤트만 받고 Stripe에게 응답은 해야함
  // 결제 성공? 다음 try로 넘어감
  if (!HANDLED_EVENTS.includes(event.type)) {
    return res.status(200).end();
  }

  // 서명 검증 후, 이벤트 저장 & Stripe에게 응답. 이제 Worker 실행됨.
  // Worker는 setInterval로 3초마다 자동 실행 중.
  try {
    await pool.query(
      `INSERT INTO stripe_events (id, event_type, payload)
       VALUES ($1, $2, $3)
       ON CONFLICT (id) DO NOTHING`,
      [event.id, event.type, event],
    );
    res.status(200).end(); // Stripe에게 이벤트 잘 받음을 알림
  } catch (err) {
    console.error("Webhook handler error:", err);
    res.status(500).send("Webhook handler failed");
  } // Stripe 에게 이벤트를 다시 보내라고 신호함.
};

export default router;
