import pool from "../config/db.js";

export async function createMenu(data) {
  const q = `
    INSERT INTO menus (name, price, description, image)
    VALUES ($1, $2, $3, $4)
    `;

  const values = [data.name, data.price, data.description, data.imgSrc];
  await pool.query(q, values);
}

export async function getMenu() {
  const q = `SELECT * FROM menus`;

  const result = await pool.query(q);
  return result.rows ?? [];
}

export async function getMenuPrices(client, menuIds) {
  const q = `
  SELECT id, price
  FROM menus
  WHERE id = ANY($1)
  `;
  const result = await client.query(q, [menuIds]);
  return result.rows;
}
