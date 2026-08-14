import express from "express";
import multer from "multer";
import { storage } from "../config/cloudinary.js";
import pool from "../config/db.js";
import { getMenus, getSingleMenuDetail } from "../services/menu-service.js";
import { verifyAdminAuth } from "../middleware/auth.middleware.js";
import { validateCreateMenu } from "../middleware/validateCreateMenu.js";
import { validateUpdateMenu } from "../middleware/validateUpdateMenu.js";
import {
  createNewMenu,
  deleteMenuById,
  updateMenu,
  updateMenuImageByMenuId,
} from "../controllers/menu.controller.js";
import { MENU_ERROR_STATUS } from "../constants/errors.js";

const router = express.Router();
const upload = multer({ storage });

router.get("/get-menus", async (req, res, next) => {
  try {
    const menu = await getMenus();
    res.status(200).json(menu);
  } catch (err) {
    console.error("fetching error,", err);
    return next(err);
  }
});

router.get("/single-menu-detail/:id", async (req, res, next) => {
  try {
    const { id } = req.params;
    const menuDetail = await getSingleMenuDetail(id);
    res.status(200).json(menuDetail);
  } catch (err) {
    return next(err);
  }
});

router.patch(
  "/:menuId",
  verifyAdminAuth,
  validateUpdateMenu,
  async (req, res) => {
    try {
      const { menuId } = req.params;
      const column = Object.keys(req.body)[0];
      const value = req.body[column];
      await updateMenu({ menuId, column, value });

      res.status(200).json({ success: true });
    } catch (err) {
      console.error("Menu update error:", err);
      const status = MENU_ERROR_STATUS[err.message] ?? 500;
      return res.status(status).json({
        error: status === 404 ? "Menu not found." : "Failed to update menu.",
      });
    }
  },
);

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
      const file = req.file;

      await updateMenuImageByMenuId(file, menuId);

      res
        .status(200)
        .json({ message: "A new image is uploaded successfully." });
    } catch (err) {
      console.error("Menu image upload error:", err);
      const status = MENU_ERROR_STATUS[err.message] ?? 500;
      return res.status(status).json({
        error:
          status === 404 ? "Menu not found." : "Failed to update menu image.",
      });
    }
  },
);

// req.file.path: Cloudinary의 최종 URL
// req.file.filename 혹은 req.file.public_id 삭제시 필요
router.post(
  "/create-menus",
  verifyAdminAuth,
  upload.single("image"),
  validateCreateMenu,
  async (req, res) => {
    try {
      if (!req.file) {
        return res.status(400).json({ error: "Image is required" });
      }

      const { name, price, description } = req.body;
      const file = req.file;

      await createNewMenu({ file, name, price, description });
      res.status(201).json({ message: "A new menu is uploaded successfully." });
    } catch (err) {
      console.error("Menu upload error:", err);
      const status = MENU_ERROR_STATUS[err.message] ?? 500;
      return res.status(status).json({
        error:
          status === 409
            ? "Menu already exists."
            : "Failed to create new menu.",
      });
    }
  },
);

router.delete("/:menuId", verifyAdminAuth, async (req, res) => {
  const client = await pool.connect();

  try {
    const { menuId } = req.params;
    await deleteMenuById(client, menuId);
    res.status(200).json({ message: "Menu deleted successfully." });
  } catch (err) {
    console.error("Menu delete error:", err);
    const status = MENU_ERROR_STATUS[err.message] ?? 500;
    return res.status(status).json({
      error: status === 404 ? "Menu not found." : "Failed to delete menu.",
    });
  } finally {
    client.release();
  }
});

export default router;
