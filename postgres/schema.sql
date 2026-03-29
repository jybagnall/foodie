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
  postal_code VARCHAR(20) NOT NULL,
  city TEXT NOT NULL,
  phone VARCHAR(20) NOT NULL,
  full_name VARCHAR(50) NOT NULL,
  is_default BOOLEAN DEFAULT FALSE

  UNIQUE (user_id, street, postal_code, city, phone, full_name)
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
--status: pending, paid, cancelled (preparing, delievered)

CREATE TABLE order_items (
  id SERIAL PRIMARY KEY,
  order_id INT REFERENCES orders(id) ON DELETE CASCADE,
  menu_id INT REFERENCES menus(id),
  qty INT NOT NULL,
  price NUMERIC(8,2) NOT NULL
);

-- stripe_payment_intent_id: Stripe 결제의 진짜 고유 ID, 절대 두번 결제되면 안 됨
-- payment_status: requires_payment, failed, refunded, succeeded
CREATE TABLE payments (
  id SERIAL PRIMARY KEY,
  order_id INT REFERENCES orders(id) UNIQUE,
  stripe_payment_intent_id VARCHAR(100) UNIQUE NOT NULL, 
  amount NUMERIC(10,2) NOT NULL,
  currency VARCHAR(10) DEFAULT 'usd',
  payment_status VARCHAR(20) DEFAULT 'requires_payment',
  updated_at TIMESTAMP DEFAULT NOW(), --웹훅 재시도나 상태 변경 때 기록
  paid_at TIMESTAMP, --실제 결제 완료 시점
  stripe_charge_id VARCHAR(100) UNIQUE, --환불할 때 필요
  failure_reason TEXT
)

-- 이벤트 저장
-- 나중에 worker가 여러개라면 'processing_by TEXT' 도 넣으면 좋음.
-- pending | processing | dead | ignored | success (이벤트 수신 상태)
CREATE TABLE stripe_events (
  id TEXT PRIMARY KEY,
  event_type TEXT NOT NULL,
  payload JSONB NOT NULL,
  status TEXT DEFAULT 'pending',
  retry_count INT DEFAULT 0,
  last_error TEXT,
  created_at TIMESTAMP DEFAULT NOW(),
  notified_at TIMESTAMP NULL,
  resolved_at TIMESTAMP NULL,
  processing_at TIMESTAMP NULL
);
--DELETE FROM stripe_events;

-- partial index: dead 상태이고 아직 알림 안 간 이벤트만 DB가 모아둠
CREATE INDEX idx_stripe_dead_unnotified
ON stripe_events (id)
WHERE status = 'dead'
AND notified_at IS NULL;

CREATE INDEX idx_stripe_failed_unresolved
ON stripe_events (created_at DESC, id DESC)
WHERE status = 'failed'
AND retry_count >= 3
AND resolved_at IS NULL;

CREATE INDEX idx_stripe_dead_unresolved
ON stripe_events (created_at DESC, id DESC)
WHERE status = 'dead'
AND resolved_at IS NULL;

-- 유저는 기본 배송지를 1개만 가진다
CREATE UNIQUE INDEX one_default_per_user  
ON addresses(user_id)  
WHERE is_default = TRUE;

-- 생성 전
CREATE TABLE payment_methods (
  id SERIAL PRIMARY KEY,
  stripe_payment_method_id VARCHAR(100) UNIQUE NOT NULL,
  brand VARCHAR(20) NOT NULL,          -- visa, mastercard, amex 등
  last4 VARCHAR(4) NOT NULL,
  exp_month SMALLINT NOT NULL CHECK (exp_month BETWEEN 1 AND 12),
  exp_year SMALLINT NOT NULL,
  created_at TIMESTAMP DEFAULT NOW()
);

-- 생성 전
CREATE TABLE order_payments (
  order_id INT NOT NULL REFERENCES orders(id) ON DELETE CASCADE,
  payment_method_id INT NOT NULL REFERENCES payment_methods(id),
  created_at TIMESTAMP DEFAULT NOW(),
  PRIMARY KEY (order_id)
);
