import pool from "../config/db.js";
import { editableMenuFields } from "../constants/menu.js";

export async function createMenu(data) {
  const q = `
    INSERT INTO menus (name, price, description, image, image_public_id)
    VALUES ($1, $2, $3, $4, $5)
    `;

  const values = [
    data.name,
    data.price,
    data.description,
    data.imgSrc,
    data.imgPublicId,
  ];
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

export async function updateMenuField(menuId, column, value) {
  if (!editableMenuFields.has(column)) {
    throw new Error(`Invalid field: ${column}`);
  }

  const q = `
    UPDATE menus
    SET ${column} = $1
    WHERE id = $2
    `;
  const values = [value, menuId];

  const result = await pool.query(q, values);
  return result;
}

export async function updateMenuImage(menuId, imgSrc, imgPublicId) {
  const q = `
  UPDATE menus
  SET image = $1, image_public_id = $2
  WHERE id = $3
  `;
  const values = [imgSrc, imgPublicId, menuId];

  const result = await pool.query(q, values);
  return result;
}
