import pool from "../config/db.js";

export async function getMenu() {
  const q = `SELECT * FROM menus`;

  try {
    const result = await pool.query(q);
    return Array.isArray(result?.rows) ? result.rows : [];
  } catch (err) {
    console.error("DB fetch error:", err.message);
    return [];
  }
}

export async function createMenu(data) {
  const q = `
    INSERT INTO menus (name, price, description, image)
    VALUES ($1, $2, $3, $4)
    `;

  const values = [data.name, data.price, data.description, data.imgSrc];

  try {
    await pool.query(q, values);
  } catch (err) {
    console.error("DB insert error", err.message);
    throw err;
  }
}
