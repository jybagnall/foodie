import pool from "../config/db.js";

export async function uploadImage({ key, imgSrc, imgPublicId }) {
  const { rows } = await pool.query(
    `SELECT public_id FROM app_settings WHERE key = $1`,
    [key],
  );
  const oldPublicId = rows[0]?.public_id ?? null;

  const q = `
    INSERT INTO app_settings (key, value, public_id)
    VALUES ($1, $2, $3)
    ON CONFLICT(key)
    DO UPDATE SET value = EXCLUDED.value, public_id = EXCLUDED.public_id
    `;
  await pool.query(q, [key, imgSrc, imgPublicId]);

  return oldPublicId;
}

export async function getImages() {
  const q = `
  SELECT key, value
  FROM app_settings
  `;
  const result = await pool.query(q);
  return Object.fromEntries(result.rows.map((r) => [r.key, r.value]));
}
// { logo_url: '...', error_img_url: '...' }
