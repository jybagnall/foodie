import pool from "../config/db.js";
import Account from "../models/account.js";

export async function createAccount(name, email, password, role = "user") {
  const account = await Account.createAccount({ name, email, password });

  const q = `
    INSERT INTO users (name, email, password, role)
    VALUES ($1, $2, $3, $4)
    RETURNING id, name, email, role
    `;

  const values = [account.name, account.email, account.passwordHash, role];

  try {
    const result = await pool.query(q, values);
    return result.rows[0];
  } catch (err) {
    console.error("DB insert error", err.message);
    throw err;
  }
}

export async function findUserByEmail(email) {
  const q = `
  SELECT id, name, email, role FROM users
  WHERE email = $1 
  `;

  const result = await pool.query(q, [email]);
  return result.rows[0];
}

export async function findUserById(id) {
  const q = `
  SELECT id, name, email, role FROM users
  WHERE id = $1 
  `;

  const result = await pool.query(q, [id]);
  return result.rows[0];
}

export async function getHashedPassword(email) {
  const q = `
  SELECT password FROM users
  WHERE email = $1
  `;

  const result = await pool.query(q, [email]);
  return result.rows[0]?.password || null;
}
