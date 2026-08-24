import pool from "../config/db.js";
import { MENU_ERROR } from "../constants/errors.js";
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

export async function deleteMenu(menuId, client) {
  const q = `
    UPDATE menus
    SET deleted_at = NOW()
    WHERE id = $1 AND deleted_at IS NULL
  `;

  const result = await client.query(q, [menuId]);

  if (result.rowCount === 0) {
    throw new Error(MENU_ERROR.MENU_NOT_FOUND);
  }
}

export async function getMenus() {
  const q = `
  SELECT * FROM menus
  WHERE deleted_at IS NULL
  `;

  const result = await pool.query(q);
  return result.rows ?? [];
}

export async function getSingleMenuDetail(id, db = pool) {
  const q = `
  SELECT * FROM menus 
  WHERE id = $1 AND deleted_at IS NULL
  `;

  const result = await db.query(q, [id]);
  return result.rows[0];
}

export async function getMenuPrices(menuIds, db = pool) {
  const q = `
  SELECT id, price
  FROM menus
  WHERE id = ANY($1) AND deleted_at IS NULL
  `;
  const result = await db.query(q, [menuIds]);
  return result.rows;
}

export async function updateMenuField(menuId, column, value) {
  if (!editableMenuFields.has(column)) {
    throw new Error(MENU_ERROR.INVALID_FIELD);
  }

  const q = `
    UPDATE menus
    SET ${column} = $1
    WHERE id = $2 AND deleted_at IS NULL
    `;

  const values = [value, menuId];
  const result = await pool.query(q, values);
  return result;
}

export async function updateMenuImage(menuId, imgSrc, imgPublicId) {
  const q = `
  UPDATE menus
  SET image = $1, image_public_id = $2
  WHERE id = $3 AND deleted_at IS NULL
  `;
  const values = [imgSrc, imgPublicId, menuId];

  const result = await pool.query(q, values);
  return result;
}
