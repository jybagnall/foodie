import { editableMenuFields } from "../constants/menu.js";

export function validateName(name) {
  if (typeof name !== "string") {
    throw new Error("Menu name must be a string.");
  }

  const normalized = name.trim();
  const length = normalized.length;

  if (length < 2 || length > 32) {
    throw new Error("Menu name must be between 2 and 32 characters.");
  }

  return normalized;
}

export function validatePrice(price) {
  if (typeof price !== "number" || !Number.isFinite(price) || price <= 0) {
    throw new Error("Price must be a number greater than 0.");
  }

  if (!/^\d+(\.\d{1,2})?$/.test(String(price))) {
    throw new Error("Price can have at most 2 decimal places.");
  }

  return price;
}

export function validateDescription(description) {
  if (typeof description !== "string") {
    throw new Error("Menu description must be a string.");
  }

  const normalized = description.trim();
  const length = normalized.length;

  if (length < 5 || length > 200) {
    throw new Error("Description must be between 5 and 200 characters.");
  }

  return normalized;
}

// const { name, price, description } = req.body;
export function validateUpdateMenu(req, res, next) {
  try {
    const keys = Object.keys(req.body);

    if (keys.length === 0) {
      return res.status(400).json({
        message: "No fields provided for update.",
      });
    }

    if (keys.length !== 1) {
      return res.status(400).json({
        message: "Exactly one field must be provided.",
      });
    }

    const key = keys[0];
    const value = req.body[key];

    if (!editableMenuFields.has(key)) {
      return res.status(400).json({
        message: `Invalid field: ${key}`,
      });
    }

    switch (key) {
      case "name":
        req.body.name = validateName(value);
        break;

      case "price":
        validatePrice(value);
        req.body.price = validatePrice(value);
        break;

      case "description":
        req.body.description = validateDescription(value);
        break;
    }

    next();
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
}
