export function validateCartBody(req, res, next) {
  const items = req.body;

  if (!Array.isArray(items)) {
    return res
      .status(400)
      .json({ error: "Request body must be an array of cart items." });
  }

  for (const item of items) {
    if (
      !item ||
      typeof item !== "object" ||
      !Number.isInteger(item.menuId) ||
      !Number.isInteger(item.qty) ||
      item.qty <= 0
    ) {
      return res.status(400).json({ error: "Invalid cart item payload." });
    }
  }

  next();
}

// [
//   { "menuId": 1, "qty": 2 },
//   { "menuId": 5, "qty": 1 }
// ]
