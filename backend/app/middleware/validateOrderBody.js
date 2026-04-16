const requiredFields = ["street", "postal_code", "city", "phone", "full_name"];

export function validateOrderBody(req, res, next) {
  try {
    const { address, orderPayload } = req.body;

    if (!address || !orderPayload?.items?.length) {
      return res.status(400).json({ error: "Invalid order data." });
    }

    const missingField = requiredFields.filter((f) => !address[f]);
    if (missingField.length > 0) {
      return res.status(400).json({
        error: `Missing address fields: ${missingField.join(", ")}`,
      });
    }

    next();
  } catch (err) {
    res
      .status(500)
      .json({ error: "Something went wrong while validating your request." });
  }
}
