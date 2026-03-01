import pool from "../config/db.js";

export async function acknowledgeFailures(lastSeenTime) {
  const q = `
    UPDATE stripe_events
    SET notified_at = NOW()
    WHERE status = 'dead'
    AND notified_at IS NULL
    AND created_at <= $1
  `;
  try {
    await pool.query(q, [lastSeenTime]);
    return { success: true };
  } catch (err) {
    console.error("DB update error", err.message);
    throw err;
  }
}

export async function getDeadEventsCount() {
  const q = `
    SELECT COUNT(*)::int AS count,
    MAX(created_at) AS last_seen_time
    FROM stripe_events
    WHERE status = 'dead'
    AND notified_at IS NULL
    `;
  const result = await pool.query(q);
  const count = result.rows[0]?.count ?? 0;
  const lastSeenTime = result.rows[0]?.last_seen_time ?? null;
  return { count, lastSeenTime };
}

export async function getEventTypes() {
  const q = `
    SELECT DISTINCT event_type
    FROM stripe_events
    WHERE
      resolved_at IS NULL
      AND (
        status = 'dead'
        OR (status = 'failed' AND retry_count >= 3)
      )
    ORDER BY event_type
    `;
  const result = await pool.query(q);
  return result.rows.map((row) => row.event_type);
}
// 결과값: [{ event_type: 'customer.created' }, ..]

const LIMIT = 6;
export async function getUnprocessedEvents({
  event_type,
  status,
  created_from,
  page,
}) {
  const offset = (page - 1) * LIMIT; // 이만큼 건너뛰고 그 다음 가져와
  const q = `
    SELECT id, event_type, status, retry_count, last_error, created_at, COUNT(*) OVER() AS total_count
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
    LIMIT $4
    OFFSET $5;
    `;
  const values = [event_type, status, created_from, LIMIT, offset];
  const result = await pool.query(q, values);
  const rows = result.rows;
  const totalMatchingEvents = rows[0]?.total_count
    ? Number(rows[0].total_count)
    : 0;
  const data = rows.map(({ total_count, ...rest }) => rest);

  return {
    data,
    totalMatchingEvents,
    pageLimit: LIMIT,
    totalPages: Math.ceil(totalMatchingEvents / LIMIT),
  };
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

// getFailedEvents()
// retryEvent(id)
// replayEvent(id)
// getEventLogs(id)
