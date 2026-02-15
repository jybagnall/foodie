import pool from "../app/config/db.js";
import { handleStripeEvent } from "../app/providers/stripe/stripe-event-service.js";

// worker 컨테이너가 시작되면 이 파일 안의 함수가 5초마다 실행.
async function processStripeEvents() {
  const client = await pool.connect();

  try {
    // 1. stripe_events 중 status='pending' 조회
    // 방금 Webhook에서 저장한 이벤트가 여기서 잡히고, 주문 확정을 함.

    // FOR UPDATE SKIP LOCKED:
    // race condition 방지, 다른 worker가 동시에 이 행을 못 건드림

    // while (true): 조건이 항상 true니까 계속 반복 (무한 루프)
    while (true) {
      await client.query("BEGIN");

      const { rows } = await client.query(`
        SELECT *
        FROM stripe_events
        WHERE status = 'pending'
        ORDER BY created_at
        FOR UPDATE SKIP LOCKED
        LIMIT 1
      `);

      if (rows.length === 0) {
        await client.query("COMMIT");
        break; // 더 이상 처리할 이벤트가 없어서 루프를 빠져나옴.
      }

      const eventRow = rows[0];

      try {
        // 실제 비즈니스 로직
        await handleStripeEvent(client, eventRow.payload);

        // 성공 처리
        await client.query(
          `UPDATE stripe_events
           SET status = 'success'
           WHERE id = $1`,
          [eventRow.id],
        );

        await client.query("COMMIT");
      } catch (err) {
        await client.query("ROLLBACK");

        // 실패 카운트는 별도 트랜잭션으로 처리
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

setInterval(processStripeEvents, 3000);
