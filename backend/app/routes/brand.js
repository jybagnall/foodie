import express from "express";
import multer from "multer";
import { storage } from "../config/cloudinary.js";
import { verifyAdminAuth } from "../middleware/auth.middleware.js";
import { getImages, uploadImage } from "../services/brand-service.js";
import { BRAND_ASSET_KEYS } from "../constants/brandAssets.js";

const router = express.Router();
const upload = multer({ storage });

// { logo_url: '...', error_img_url: '...' }
router.get("/assets", async (req, res) => {
  try {
    const imgUrls = await getImages();
    res.status(200).json(imgUrls);
  } catch (err) {
    console.error("fetching error,", err.message);
    res
      .status(500)
      .json({ error: "Something went wrong while loading brand assets." });
  }
});

// req.file.path: Cloudinary의 최종 URL
// req.file.filename 혹은 req.file.public_id 삭제시 필요
router.post(
  "/assets",
  verifyAdminAuth,
  upload.single("image"),
  async (req, res) => {
    try {
      if (!req.file) {
        return res.status(400).json({ error: "Image is required" });
      }

      const { assetType } = req.body;
      const key = BRAND_ASSET_KEYS[assetType];

      if (!key) {
        return res.status(400).json({
          error: "Invalid asset type",
        });
      }

      const imgSrc = req.file.path;
      await uploadImage({ key, imgSrc });
      res
        .status(200)
        .json({ message: "A new image is uploaded successfully." });
    } catch (err) {
      console.error("Brand asset upload error,", err.message);
      res
        .status(500)
        .json({ error: "Something went wrong while uploading the image." });
    }
  },
);

export default router;
