CREATE TABLE admin_invites (
  id SERIAL PRIMARY KEY,
  email VARCHAR(255) NOT NULL,
  token VARCHAR(255) UNIQUE NOT NULL,
  expires_at TIMESTAMP NOT NULL,
  used BOOLEAN DEFAULT FALSE
);

CREATE TYPE role_enum AS ENUM ('user', 'admin');

CREATE TABLE users (
  id SERIAL PRIMARY KEY,
  created_at TIMESTAMP DEFAULT NOW(),
  name VARCHAR(32) NOT NULL,
  email VARCHAR(255) UNIQUE NOT NULL,
  password TEXT NOT NULL, 
  role role_enum NOT NULL,
  stripe_customer_id VARCHAR(100),
  password_reset_token TEXT,
  password_reset_requested_at TIMESTAMP,
  current_refresh_token TEXT
);

CREATE TABLE addresses (
  id SERIAL PRIMARY KEY,
  created_at TIMESTAMP DEFAULT NOW(),
  user_id INT REFERENCES users(id) ON DELETE CASCADE,
  street TEXT NOT NULL,
  postal_code INTEGER NOT NULL,
  city TEXT NOT NULL,
  phone VARCHAR(20) NOT NULL,
  full_name VARCHAR(50) NOT NULL
);

CREATE TABLE menus (
  id SERIAL PRIMARY KEY,
  created_at TIMESTAMP DEFAULT NOW(),
  name VARCHAR(32) UNIQUE NOT NULL,
  price NUMERIC(5,2) NOT NULL,
  description TEXT NOT NULL,
  image TEXT NOT NULL
);

-- one cart per user, 
CREATE TABLE saved_carts (
  id SERIAL PRIMARY KEY,
  user_id INT UNIQUE REFERENCES users(id) ON DELETE CASCADE,
  updated_at TIMESTAMP DEFAULT NOW()
);

CREATE TABLE saved_cart_items (
  id SERIAL PRIMARY KEY,
  cart_id INT REFERENCES saved_carts(id) ON DELETE CASCADE,
  menu_id INT REFERENCES menus(id),
  qty INT NOT NULL
);

CREATE TABLE orders (
  id SERIAL PRIMARY KEY,
  user_id INT REFERENCES users(id),
  address_id INT REFERENCES addresses(id),
  total_amount NUMERIC(8,2) NOT NULL,
  status VARCHAR(20) DEFAULT 'pending',
  created_at TIMESTAMP DEFAULT NOW()
);
--status: pending, paid, cancelled

CREATE TABLE order_items (
  id SERIAL PRIMARY KEY,
  order_id INT REFERENCES orders(id) ON DELETE CASCADE,
  menu_id INT REFERENCES menus(id),
  qty INT NOT NULL,
  price NUMERIC(8,2) NOT NULL
);

CREATE TABLE payments (
  id SERIAL PRIMARY KEY,
  user_id INT REFERENCES users(id) ON DELETE CASCADE,
  order_id INT REFERENCES orders(id),
  stripe_payment_intent_id VARCHAR(100) NOT NULL,
  stripe_customer_id VARCHAR(100),
  amount NUMERIC(10,2) NOT NULL,
  currency VARCHAR(10) DEFAULT 'usd',
  payment_status VARCHAR(20) DEFAULT 'requires_payment',
  payment_method VARCHAR(50),
  receipt_url TEXT,
  card_brand VARCHAR(20),
  card_last4 VARCHAR(10),
  card_exp_month SMALLINT,
  card_exp_year SMALLINT,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
)
--payment_status: succeeded, failed, refunded