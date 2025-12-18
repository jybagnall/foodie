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

// export async function createMenu(formData) {
//   const account = MenuService.createMenu(formData);

//   const q = `
//     INSERT INTO users (name, email, password, role)
//     VALUES ($1, $2, $3, $4)
//     RETURNING id, name, email, role"
//     `;

//   const values = [account.name, account.email, account.passwordHash, role];

//   try {
//     const result = await pool.query(q, values);
//     return result.rows[0];
//   } catch (err) {
//     console.error("DB insert error", err.message);
//     throw err;
//   }
// }
