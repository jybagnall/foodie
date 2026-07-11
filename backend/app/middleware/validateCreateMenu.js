import {
  validateName,
  validatePrice,
  validateDescription,
} from "./validateUpdateMenu.js";
import { cloudinary } from "../config/cloudinary.js";

export async function validateCreateMenu(req, res, next) {
  try {
    const imgSrc = req.file?.path;

    if (!imgSrc) {
      return res.status(400).json({ error: "Image upload failed." });
    }

    req.body.name = validateName(req.body.name);
    req.body.description = validateDescription(req.body.description);
    req.body.price = validatePrice(Number(req.body.price));

    next();
  } catch (err) {
    if (req.file?.filename) {
      await cloudinary.uploader.destroy(req.file.filename).catch(() => {});
    }

    console.error("Menu validation error:", err.message);
    res
      .status(500)
      .json({ error: "Something went wrong while validating your request." });
  }
}
