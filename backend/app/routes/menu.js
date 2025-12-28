import express from "express";
import multer from "multer";
import { storage } from "../config/cloudinary.js";
import { createMenu, getMenu } from "../services/menu-service.js";
import { verifyAdminAuth } from "../middleware/auth.middleware.js";

const router = express.Router();
const upload = multer({ storage });

router.get("/get-menu", async (req, res) => {
  try {
    const menu = await getMenu();
    res.status(200).json(menu);
  } catch (err) {
    console.error("fetching error,", err.message);
    res
      .status(500)
      .json({ error: "Something went wrong while loading the menu." });
  }
});

// req.file.path: Cloudinary의 최종 URL
// req.file.filename 혹은 req.file.public_id 삭제시 필요
router.post(
  "/create-menu",
  verifyAdminAuth,
  upload.single("image"),
  async (req, res) => {
    try {
      const name = req.body.name?.trim();
      const price = parseFloat(req.body.price);
      const description = req.body.description?.trim();
      const imgSrc = req.file?.path;

      if (!imgSrc) {
        return res.status(400).json({ error: "Image upload failed." });
      }

      if (isNaN(price) || price <= 0) {
        return res.status(400).json({ error: "Invalid price value." });
      }

      if (!name || !price || !description) {
        return res.status(400).json({ error: "Invalid menu data" });
      }

      await createMenu({ name, price, description, imgSrc });
      res.status(200).json({ message: "A new menu is uploaded successfully." });
    } catch (err) {
      console.error("Menu upload error,", err.message);
      res
        .status(500)
        .json({ error: "Something went wrong while uploading the menu." });
    }
  },
);

export default router;
