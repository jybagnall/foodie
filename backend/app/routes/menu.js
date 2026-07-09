import express from "express";
import multer from "multer";
import { storage } from "../config/cloudinary.js";
import {
  createMenu,
  getMenus,
  getSingleMenuDetail,
  updateMenuImage,
} from "../services/menu-service.js";
import { verifyAdminAuth } from "../middleware/auth.middleware.js";
import { validateMenuBody } from "../middleware/validateMenuBody.js";

const router = express.Router();
const upload = multer({ storage });

router.get("/get-menus", async (req, res) => {
  try {
    const menu = await getMenus();
    res.status(200).json(menu);
  } catch (err) {
    console.error("fetching error,", err.message);
    res
      .status(500)
      .json({ error: "Something went wrong while loading the menu." });
  }
});

router.get("/single-menu-detail/:id", async (req, res) => {
  try {
    const { id } = req.params;
    const menuDetail = await getSingleMenuDetail(id);
    res.status(200).json(menuDetail);
  } catch (err) {
    console.error("fetching error,", err.message);
    res
      .status(500)
      .json({ error: "Something went wrong while loading the menu." });
  }
});

router.patch(
  "/:menuId/image",
  verifyAdminAuth,
  upload.single("image"),
  async (req, res) => {
    try {
      if (!req.file) {
        return res.status(400).json({ error: "Image is required" });
      }

      const { menuId } = req.params;
      const imgSrc = req.file.path;
      await updateMenuImage(menuId, imgSrc);
      res
        .status(200)
        .json({ message: "A new image is uploaded successfully." });
    } catch (err) {
      console.error("Menu image upload error,", err.message);
      res
        .status(500)
        .json({ error: "Something went wrong while uploading the image." });
    }
  },
);

// req.file.path: Cloudinary의 최종 URL
// req.file.filename 혹은 req.file.public_id 삭제시 필요
router.post(
  "/create-menu",
  verifyAdminAuth,
  upload.single("image"),
  validateMenuBody,
  async (req, res) => {
    try {
      if (!req.file) {
        return res.status(400).json({ error: "Image is required" });
      }

      const { name, price, description } = req.body;
      const imgSrc = req.file.path;
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
