const REQUIRED_ADDRESS_FIELDS = [
  "street",
  "postal_code",
  "city",
  "state",
  "phone",
  "full_name",
];

export function validateOrderBody(req, res, next) {
  const { address, orderPayload } = req.body;

  if (!address || typeof address !== "object" || !orderPayload?.items?.length) {
    return res.status(400).json({ error: "Invalid order data." });
  }

  const missingField = REQUIRED_ADDRESS_FIELDS.filter((f) => !address[f]);

  if (missingField.length > 0) {
    return res.status(400).json({
      error: `Missing address fields: ${missingField.join(", ")}`,
    });
  }

  next();
}
