export function validateMenuBody(req, res, next) {
  try {
    const name = req.body.name?.trim();
    const description = req.body.description?.trim();
    const price = parseFloat(req.body.price);
    const imgSrc = req.file?.path;

    if (!imgSrc) {
      return res.status(400).json({ error: "Image upload failed." });
    }

    if (!name) {
      return res.status(400).json({ error: "Name is required." });
    }

    if (!description) {
      return res.status(400).json({ error: "Description is required." });
    }

    if (name.length < 2 || name.length > 50) {
      return res.status(400).json({ error: "Name must be 2–50 characters." });
    }

    if (isNaN(price) || price <= 0) {
      return res.status(400).json({ error: "Invalid price value." });
    }

    req.body.name = name;
    req.body.description = description;
    req.body.price = price;

    next();
  } catch (err) {
    console.error("Menu validation error:", err.message);
    res
      .status(500)
      .json({ error: "Something went wrong while validating your request." });
  }
}
