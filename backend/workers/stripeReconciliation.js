import Stripe from "stripe";
import pool from "../app/config/db";

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);

// Webhook 완전 실패 대비용
// Webhook 실패 + Stripe 재시도 실패 시 복구할 자동 전략
// 최근 Stripe 이벤트 조회, DB에 없는 이벤트 찾기, 누락된 이벤트 복구
async function reconcileStripeEvents() {
  const events = await stripe.events.list({
    limit: 50,
  });

  for (const event of events.data) {
    const { rows } = await pool.query(
      `SELECT id FROM stripe_events WHERE id = $1`,
      [event.id],
    );

    if (rows.length === 0) {
      console.log("Missing event found:", event.id);

      await pool.query(
        `INSERT INTO stripe_events (id, type, payload)
         VALUES ($1, $2, $3)
         ON CONFLICT DO NOTHING`,
        [event.id, event.type, event],
      );
    }
  }
}

setInterval(reconcileStripeEvents, 60 * 60 * 1000);
