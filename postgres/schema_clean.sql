CREATE TABLE admin_invites (
  id SERIAL PRIMARY KEY,
  email VARCHAR(255) NOT NULL,
  token VARCHAR(255) UNIQUE NOT NULL,
  expires_at TIMESTAMP NOT NULL,
  used BOOLEAN DEFAULT FALSE
);

CREATE TYPE role_enum AS ENUM ('user', 'admin')

CREATE TABLE users (
  id SERIAL PRIMARY KEY,
  created_at TIMESTAMP DEFAULT NOW(),
  name VARCHAR(32) UNIQUE NOT NULL,
  email VARCHAR(255) UNIQUE NOT NULL,
  password TEXT NOT NULL, 
  role role_enum NOT NULL,
  password_reset_token TEXT,
  password_reset_requested_at TIMESTAMP
);

CREATE TABLE addresses (
  id SERIAL PRIMARY KEY,
  created_at TIMESTAMP DEFAULT NOW(),
  user_id INT REFERENCES users(id) ON DELETE CASCADE,
  street TEXT NOT NULL,
  postal_code INTEGER NOT NULL,
  city TEXT NOT NULL,
);

CREATE TABLE menus (
  id SERIAL PRIMARY KEY,
  created_at TIMESTAMP DEFAULT NOW(),
  name VARCHAR(32) UNIQUE NOT NULL,
  price NUMERIC(5,2) NOT NULL,
  description TEXT NOT NULL,
  image TEXT NOT NULL
);