import pool from "../config/db.js";

export async function getDeadEventsCount() {
  const q = `
  SELECT COUNT(*)::int AS count
  FROM stripe_events
  WHERE status = 'dead'
  AND notified_at IS NULL
  `;
  const result = await pool.query(q);
  return result.rows[0]?.count ?? 0;
}

const LIMIT = 20;
export async function getUnprocessedEvents(
  event_type,
  status,
  created_from,
  page = 1,
) {
  const offset = (page - 1) * LIMIT; // 이만큼 건너뛰고 그 다음 가져와
  const q = `
    SELECT id, event_type, status, retry_count, last_error, 
           created_at, COUNT(*) OVER() AS total_count
    FROM stripe_events
    WHERE
      resolved_at IS NULL
      AND (
        status = 'dead'
        OR (status = 'failed' AND retry_count >= 3)
      )
      AND ($1::text IS NULL OR event_type = $1)
      AND ($2::text IS NULL OR status = $2)
      AND ($3::timestamp IS NULL OR created_at >= $3)
    ORDER BY created_at DESC, id DESC
    LIMIT ${LIMIT}
    OFFSET ${offset};
    `;
  const values = [event_type ?? null, status ?? null, created_from ?? nullS];
  const result = await pool.query(q, values);
  const rows = result.rows;
  const total = rows[0]?.total_count ? Number(rows[0].total_count) : 0;
  const data = rows.map(({ total_count, ...rest }) => rest);
  return { data, total };
}

export async function getUnprocessedEventsCount() {
  const q = `
    SELECT 
      COUNT(*) FILTER (
        WHERE status = 'failed' AND retry_count >= 3
      )::int AS "failedCount", 
      
      COUNT(*) FILTER (
        WHERE status = 'dead'
      )::int AS "deadCount"
    FROM stripe_events
    WHERE resolved_at IS NULL
    `;
  const result = await pool.query(q);
  return result.rows[0] ?? { failedCount: 0, deadCount: 0 };
}

export async function acknowledgeFailures() {
  const q = `
    UPDATE stripe_events
    SET notified_at = NOW()
    WHERE status = 'dead'
    AND notified_at IS NULL;
  `;
  try {
    await pool.query(q);
    return { success: true };
  } catch (err) {
    console.error("DB update error", err.message);
    throw err;
  }
}
// getFailedEvents()
// retryEvent(id)
// replayEvent(id)
// getEventLogs(id)
