import pool from "../app/config/db.js";
import { handleStripeEvent } from "../app/services/stripe-event-service.js";

// worker 컨테이너가 시작되면 이 파일 안의 함수가 5초마다 실행.
async function processStripeEvents() {
  const client = await pool.connect();

  try {
    // 1. stripe_events 중 status='pending' 조회
    // (FOR UPDATE SKIP LOCKED: race condition 방지, 다른 worker가 동시에 이 행을 못 건드림)
    const { rows } = await client.query(`
      SELECT * FROM stripe_events
      WHERE status = 'pending'
      ORDER BY created_at
      FOR UPDATE SKIP LOCKED
      LIMIT 10
    `);

    // 2. 하나씩 handleStripeEvent 호출
    for (const eventRow of rows) {
      try {
        await handleStripeEvent(eventRow.payload);

        await client.query(
          `UPDATE stripe_events SET status = 'success' WHERE id = $1`,
          [eventRow.id],
        );
      } catch (err) {
        await client.query(
          `UPDATE stripe_events 
           SET retry_count = retry_count + 1,
               last_error = $2,
               status = CASE 
                         WHEN retry_count + 1 >= 5 THEN 'dead'
                         ELSE 'pending'
                       END
           WHERE id = $1`,
          [eventRow.id, err.message],
        );
      }
    }
  } finally {
    client.release();
  }
}

console.log("Stripe Worker started...");

setInterval(processStripeEvents, 5000);
