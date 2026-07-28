import "dotenv/config";

import express from "express";
import http from "http";
import path from "path";
import cors from "cors";
import cookieParser from "cookie-parser";
import { fileURLToPath } from "url";

import accountRoutes from "./app/routes/account.js";
import addressRoutes from "./app/routes/address.js";
import adminRoutes from "./app/routes/admin.js";
import menuRoutes from "./app/routes/menu.js";
import orderRoutes from "./app/routes/order.js";
import paymentRoutes from "./app/routes/payment.js";
import paymentMethodsRoutes from "./app/routes/paymentMethods.js";
import cartRoutes from "./app/routes/cart.js";
import stripeRoutes from "./app/routes/stripe.js";
import brandRoutes from "./app/routes/brand.js";
import { stripeWebhookHandler } from "./app/routes/stripeWebhook.js";

const app = express();
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const server = http.createServer(app); // create HTTP server

const PORT = process.env.PORT || 5000;
const host = process.env.HOST || "0.0.0.0";

// Stripe webhook은 express.json()보다 먼저, 단독 등록
// Stripe 전용 raw endpoint
app.post(
  "/api/stripe/webhook",
  express.raw({ type: "application/json" }),
  stripeWebhookHandler,
);

// 공통 미들웨어
app.use(
  cors({
    origin: process.env.FRONTEND_INTERNAL_URL,
    credentials: true,
    methods: ["GET", "POST", "PATCH", "DELETE"],
  }),
);
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, "public")));

// 요청 로그 (라우터보다 앞에 있어서 모든 요청이 기록됨)
app.use((req, res, next) => {
  console.log(
    `🚩req at [${new Date().toISOString()}]: ${req.method} ${req.url}`,
  );
  next();
});

app.use("/api/accounts", accountRoutes);
app.use("/api/addresses", addressRoutes);
app.use("/api/admins", adminRoutes);
app.use("/api/menu", menuRoutes);
app.use("/api/orders", orderRoutes);
app.use("/api/payments", paymentRoutes);
app.use("/api/payment-methods", paymentMethodsRoutes);
app.use("/api/carts", cartRoutes);
app.use("/api/stripe", stripeRoutes);
app.use("/api/brand", brandRoutes);

// 404
app.use((req, res) => {
  res.status(404).json({ error: "Not Found" });
});

app.use((err, req, res, next) => {
  console.error("❌error:", err);

  // 이미 응답이 시작된 경우 Express 기본 에러 핸들러에 위임
  if (res.headersSent) {
    return next(err);
  }

  const status = err.status || 500;
  let message = err.message;

  if (process.env.NODE_ENV !== "development" && status >= 500) {
    message = "Internal Server Error";
  }

  res.status(status).json({ error: message });
});

server.listen(PORT, host, () => {
  console.log(`🔹Server running on ${host}:${PORT}`);
});

export default app;
