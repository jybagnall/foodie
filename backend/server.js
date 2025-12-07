import express from "express";
import http from "http";
import path from "path";
import cors from "cors";
import cookieParser from "cookie-parser";
import dotenv from "dotenv";
import Stripe from "stripe";
import { fileURLToPath } from "url";

import accountRoutes from "./app/routes/account";
import adminRoutes from "./app/routes/admin";
import menuRoutes from "./app/routes/menu";

dotenv.config();
const app = express();
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const server = http.createServer(app); // create HTTP server

// const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);

const PORT = process.env.PORT || 5000;
const host = process.env.HOST || "0.0.0.0";

app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, "public")));

app.use(
  cors({
    origin: process.env.FRONTEND_URL,
    credentials: true,
    methods: ["GET", "POST", "PATCH", "DELETE"],
  })
);

app.use("/api/accounts", accountRoutes);
app.use("/api/admins", adminRoutes);
app.use("/api/menu", menuRoutes);

app.use((req, res, next) => {
  console.log(
    `🚩req at [${new Date().toISOString()}]: ${req.method} ${req.url}`
  );
  next();
});

app.use((err, req, res, next) => {
  console.error("❌error:", err.message);
  if (process.env.NODE_ENV === "development") {
    res.status(500).json({ error: err.message });
  } else {
    res.status(500).json({ error: "Internal Server Error" });
  }
});

server.listen(PORT, host, () => {
  console.log(`🔹Server running on ${host}:${PORT}`);
});

export default app;
