import {
  handlePaymentIntentSucceeded,
  handlePaymentIntentFailed,
} from "./stripe-handlers.js";
import pool from "../../config/db.js";

const handlers = {
  "payment_intent.succeeded": handlePaymentIntentSucceeded,
  "payment_intent.payment_failed": handlePaymentIntentFailed,
};

export async function handleStripeEvent(event) {
  // 관심 없는 이벤트는 즉시 종료
  if (!handlers[event.type]) return;

  const client = await pool.connect();

  try {
    await client.query("BEGIN");

    // 우리가 관심 있는 이벤트만 처리
    await handlers[event.type](client, event.data.object);
    await client.query("COMMIT");
  } catch (err) {
    await client.query("ROLLBACK");
    throw err;
  } finally {
    client.release();
  }
}
