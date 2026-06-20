import pool from "../config/db.js";

export async function uploadImage({ key, imgSrc }) {
  const q = `
    INSERT INTO app_settings (key, value)
    VALUES ($1, $2)
    ON CONFLICT(key)
    DO UPDATE SET value = EXCLUDED.value
    `;
  await pool.query(q, [key, imgSrc]);
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
