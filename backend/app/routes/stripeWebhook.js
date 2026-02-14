import express from "express";
import Stripe from "stripe";
import pool from "../config/db.js";

// ❗Webhook 에러 재처리 전략
// ❗Webhook이 아예 실패했을 가능성 대비해서 물어볼 수 있음:
// stripe.paymentIntents.retrieve(paymentIntentId)
// ❗환불 처리 (charge.refunded), 별도의 테이블이 필요함
// ❗"payment_intent.canceled"
// ❗"payment_intent.processing"

const router = express.Router();
const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);

// POST /api/stripe/webhook
// 결제 시도 후, Stripe가 상태를 확정 후 Webhook URL 호출함.

router.post(
  "/webhook",
  express.raw({ type: "application/json" }),
  async (req, res) => {
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
      console.error("Webhook signature verification failed.", err.message);
      return res.status(400).send(`Webhook Error: ${err.message}`);
    }

    // 서명 검증 후, 이벤트 저장 & Stripe에게 응답. 이제 Worker 실행할 예정
    //  Worker를 직접 호출하지 않고, setInterval로 5초마다 자동 실행 중.
    try {
      await pool.query(
        `
        INSERT INTO stripe_events (id, event_type, payload)
        VALUES ($1, $2, $3)
        ON CONFLICT (id) DO NOTHING
        `,
        [event.id, event.type, event],
      );
      res.status(200).end(); // Stripe에게 이벤트 잘 받음을 알림
    } catch (err) {
      console.error("Webhook handler error:", err);

      // 영구적인 오류
      if (err.message.includes("Missing orderId")) {
        return res.status(200).end();
      }

      res.status(500).send("Webhook handler failed");
    } //❗🤔 Stripe 재시도를 트리거하기 위한 신호, Worker와는 관계 없음.
  },
);

export default router;
