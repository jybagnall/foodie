import pool from "../app/config/db.js";
import { handleStripeEvent } from "../app/providers/stripe/stripe-event-service.js";

// worker 컨테이너가 시작되면 startStripeWorker 가 3초마다 DB를 확인해서 처리할 이벤트가 있는지 봄.
// 방금 Webhook에서 저장한 pending 이벤트가 여기서 잡히고, 주문 확정을 함.

// FOR UPDATE SKIP LOCKED:
// race condition 방지, 다른 worker가 동시에 이 행을 못 건드림

function sleep(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

const PROCESSING_TIMEOUT_MINS =
  parseInt(process.env.STRIPE_WORKER_TIMEOUT_MINUTES) || 10;

let isShuttingDown = false;

// 나중에 컨테이너 종료 명령 → OS가 SIGTERM 신호 전송 →
// 현재 루프 트랜잭션 끝나면 while 조건 false → 루프 종료
process.on("SIGTERM", () => {
  console.log("SIGTERM received, finishing current job...");
  isShuttingDown = true;
});

async function startStripeWorker() {
  const client = await pool.connect();
  // SELECT + LOCK + UPDATE 한번에 실행
  // 루프 안의 트랜잭션은 끝까지 처리됨
  // isShuttingDown이 true가 되면 다음 루프 진입 안 함
  try {
    while (!isShuttingDown) {
      try {
        await client.query("BEGIN");

        const { rows } = await client.query(`
          UPDATE stripe_events
          SET status = 'processing',
              processing_at = NOW()
          WHERE id = (
            SELECT id
            FROM stripe_events
            WHERE 
            (
              status = 'pending'
              OR (status = 'processing' AND processing_at < NOW() - interval '${PROCESSING_TIMEOUT_MINS} minutes')
              )
            AND retry_count < 5
            ORDER BY created_at
            FOR UPDATE SKIP LOCKED
            LIMIT 1
            )
          RETURNING *
        `); // pending 이벤트 & worker가 죽어서 멈춘 이벤트 먼저 가져옴, 즉
        // worker가 죽었다고 가정하고 다른 (혹은 같은) worker가 다시 처리

        // 더 이상 처리할 이벤트 없음
        if (rows.length === 0) {
          await client.query("COMMIT");
          await sleep(3000);
          continue; // while 루프 처음으로 돌아감
        }

        const eventRow = rows[0];

        try {
          const result = await handleStripeEvent(client, eventRow.payload);
          const newStatus = result.ignored ? "ignored" : "success";
          // 성공 처리
          await client.query(
            `
          UPDATE stripe_events
          SET status = $1,
          resolved_at = NOW()
          WHERE id = $2
          `,
            [newStatus, eventRow.id],
          );

          await client.query("COMMIT");
        } catch (err) {
          await client.query("ROLLBACK"); // 현재 트랜잭션 취소
          await client.query("BEGIN"); // 실패 카운트 증가를 위한 새 트랜잭션 시작
          await client.query(
            `
            UPDATE stripe_events
            SET retry_count = retry_count + 1,
              last_error = $2,
              status = CASE
                WHEN retry_count + 1 >= 5 THEN 'dead'
                ELSE 'pending'
                END
                WHERE id = $1
                `,
            [eventRow.id, err.message],
          );
          await client.query("COMMIT");
        }
      } catch (err) {
        await client.query("ROLLBACK").catch(() => {}); // 이미 롤백이 되었다면 무시.
        console.error("Worker fatal error:", err);
      }
    } // while true 끝남
  } finally {
    client.release();
    console.log("Worker shut down cleanly");
  }
}

// Worker 루프 시작 && Worker가 예상치 못하게 종료되면
// 비정상 종료 신호를 보내고 Docker가 자동으로 재시작
startStripeWorker().catch((err) => {
  console.error("Worker crashed:", err);
  process.exit(1);
});
