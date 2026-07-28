import "dotenv/config";
import Stripe from "stripe";
import pool from "../app/config/db";
import { STRIPE_HANDLED_EVENTS } from "../app/constants/stripe";

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);

async function getLastCheckedAt() {
  const { rows } = await pool.query(
    `
      SELECT last_checked_at 
      FROM reconciliation_state
      WHERE id = $1
    `,
    ["stripe_reconciliation"],
  );

  // 최초 실행이면 상태가 없으니, 24시간 전부터 시작
  return rows[0]?.last_checked_at ?? new Date(Date.now() - 24 * 60 * 60 * 1000);
}

async function setLastCheckedAt(timestamp) {
  await pool.query(
    `
      INSERT INTO reconciliation_state (id, last_checked_at)
      VALUES ('stripe_reconciliation', $1)
      ON CONFLICT (id) DO UPDATE SET last_checked_at = $1
    `,
    [timestamp],
  );
}

// Webhook 완전 실패 대비용
// Webhook 실패 + Stripe 재시도 실패 시 복구할 자동 전략
// 최근 Stripe 이벤트 조회, DB에 없는 이벤트 찾기, 누락된 이벤트 복구

async function reconcileStripeEvents() {
  const runStartAt = new Date(); // Worker 가 실행을 시작한 시각

  try {
    const lastCheckedAt = await getLastCheckedAt();

    const events = stripe.events.list({
      created: { gte: Math.floor(lastCheckedAt.getTime() / 1000) },
      // Stripe는 초 단위 unix timestamp
      limit: 100,
    });

    for await (const event of events) {
      // 해당되는 이벤트가 없다면 다음 이벤트로 넘어감
      // (루프 안이라 return 대신 continue를 씀)
      if (!STRIPE_HANDLED_EVENTS.includes(event.type)) continue;

      const { rows } = await pool.query(
        `
          SELECT id 
          FROM stripe_events 
          WHERE stripe_event_id = $1
        `,
        [event.id],
      );

      if (rows.length === 0) {
        // DB에 없는 이벤트가 발견됨
        console.log("Missing event found:", event.id);

        await pool.query(
          `
            INSERT INTO stripe_events (stripe_event_id, event_type, payload)
            VALUES ($1, $2, $3)
            ON CONFLICT (stripe_event_id) DO NOTHING
          `,
          [event.id, event.type, event],
        );
      }
    }
    await setLastCheckedAt(runStartAt); // 여기까지 훑었음을 기록함
  } catch (err) {
    console.error("Reconciliation failed:", err);
    // lastCheckedAt을 갱신 안 함 → 다음 실행 때 이번 구간을 다시 처음부터 훑음 (안전)
  }
}

const INTERVAL_MS = 60 * 60 * 1000; // 1시간
const intervalId = setInterval(reconcileStripeEvents, INTERVAL_MS);

reconcileStripeEvents(); // 시작 시 즉시 1회 실행

// Docker가 종료 신호를 보내면 예정된 함수 실행을 취소함
process.on("SIGTERM", () => {
  console.log("SIGTERM received, stopping reconciliation interval...");
  clearInterval(intervalId);
});
