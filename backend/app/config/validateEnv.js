const requiredEnvVars = [
  "NODE_ENV",
  "PORT",

  "FRONTEND_INTERNAL_URL",
  "BACKEND_URL",
  "FRONTEND_PUBLIC_URL",

  "STRIPE_SECRET_KEY",
  "STRIPE_WEBHOOK_SECRET",
  "STRIPE_WORKER_TIMEOUT_MINUTES",

  "RESEND_API_KEY",

  "CLOUDINARY_SECRET",
  "CLOUDINARY_KEY",
  "CLOUDINARY_NAME",

  "DB_HOST",
  "DB_USER",
  "DB_PASS",
  "DB_NAME",
  "DB_PORT",
  "DB_SSL",

  "JWT_ACCESS_TOKEN_SECRET",
  "JWT_REFRESH_TOKEN_SECRET",
];

const missingRequired = requiredEnvVars.filter((key) => !process.env[key]);

if (missingRequired.length > 0) {
  throw new Error(
    `Missing required environment variables: ${missingRequired.join(", ")}`,
  );
}

const numericEnvVars = ["PORT", "STRIPE_WORKER_TIMEOUT_MINUTES", "DB_PORT"];

const invalidNumeric = numericEnvVars.filter((key) => {
  const value = Number(process.env[key]);

  return !Number.isInteger(value) || value <= 0;
});

if (invalidNumeric.length > 0) {
  throw new Error(
    `The following environment variables must be positive integers: ${invalidNumeric.join(", ")}`,
  );
}

if (!["development", "production", "test"].includes(process.env.NODE_ENV)) {
  throw new Error(`Invalid NODE_ENV: ${process.env.NODE_ENV}`);
}

if (!["true", "false"].includes(process.env.DB_SSL)) {
  throw new Error(
    `DB_SSL must be "true" or "false". Received: ${process.env.DB_SSL}`,
  );
}
