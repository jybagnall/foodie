import pool from "../config/db";
import Account from "../models/account";

export async function createAccount(name, email, password) {
  const account = Account.createAccount(name, email, password);

  const q = `
    INSERT INTO users (name, email, password)
    VALUES ($1, $2, $3)
    RETURNING id, name, email"
    `;

  const values = [account.name, account.email, account.passwordHash];

  try {
    const result = await pool.query(q, values);
    return result.rows[0];
  } catch (err) {
    console.error("DB insert error", err.message);
    throw err;
  }
}

export async function getHashedPassword(email) {
  const q = `
  SELECT password FROM users
  WHERE email = $1
  `;

  const result = await pool.query(q, [email]);
  return result.rows[0]?.password || null;
}

export async function findUserByEmail(email) {
  const q = `
  SELECT id, username FROM users
  WHERE email = $1
  `;

  const result = await pool.query(q, [email]);
  return result.rows[0];
}
