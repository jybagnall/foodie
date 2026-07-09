import pool from "../config/db.js";

export async function createMenu(data) {
  const q = `
    INSERT INTO menus (name, price, description, image)
    VALUES ($1, $2, $3, $4)
    `;

  const values = [data.name, data.price, data.description, data.imgSrc];
  await pool.query(q, values);
}

export async function getMenus() {
  const q = `SELECT * FROM menus`;

  const result = await pool.query(q);
  return result.rows ?? [];
}

export async function getSingleMenuDetail(id) {
  const q = `SELECT * FROM menus WHERE id = $1`;

  const result = await pool.query(q, [id]);
  return result.rows[0];
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

export async function updateMenuImage(menuId, imgSrc) {
  const q = `
  UPDATE menus
  SET image = $1
  WHERE id = $2
  `;
  const values = [imgSrc, menuId];

  await pool.query(q, values);
  return { success: true };
}
