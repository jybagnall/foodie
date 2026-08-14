import express from "express";
import multer from "multer";
import { storage } from "../config/cloudinary.js";
import { verifyAdminAuth } from "../middleware/auth.middleware.js";
import { getImages } from "../services/brand-service.js";
import { uploadBrandAsset } from "../controllers/brand.controller.js";

const router = express.Router();
const upload = multer({ storage });

// { logo_url: '...', error_img_url: '...' }
router.get("/assets", async (req, res, next) => {
  try {
    const imgUrls = await getImages();
    res.status(200).json(imgUrls);
  } catch (err) {
    console.error("fetching error,", err);
    return next(err);
  }
});

// req.file.path: Cloudinary의 최종 URL
// req.file.filename 혹은 req.file.public_id 삭제시 필요
router.post(
  "/assets",
  verifyAdminAuth,
  upload.single("image"),
  async (req, res, next) => {
    try {
      if (!req.file) {
        return res.status(400).json({ error: "Image is required" });
      }

      const { assetType } = req.body;
      const file = req.file;
      await uploadBrandAsset(assetType, file);
      res
        .status(200)
        .json({ message: "A new image is uploaded successfully." });
    } catch (err) {
      if (err.message === "INVALID_ASSET_TYPE") {
        return res.status(400).json({ error: "Invalid asset type" });
      }

      return next(err);
    }
  },
);

export default router;
