import express from "express";
import multer from "multer";
import { storage } from "../config/cloudinary.js";
import pool from "../config/db.js";
import { cloudinary } from "../config/cloudinary.js";
import {
  createMenu,
  deleteMenu,
  getMenus,
  getSingleMenuDetail,
  updateMenuField,
  updateMenuImage,
} from "../services/menu-service.js";
import { verifyAdminAuth } from "../middleware/auth.middleware.js";
import { validateCreateMenu } from "../middleware/validateCreateMenu.js";
import { validateUpdateMenu } from "../middleware/validateUpdateMenu.js";

const router = express.Router();
const upload = multer({ storage });

router.get("/get-menus", async (req, res) => {
  try {
    const menu = await getMenus();
    res.status(200).json(menu);
  } catch (err) {
    console.error("fetching error,", err);
    res
      .status(500)
      .json({ message: "Something went wrong while loading the menu." });
  }
});

router.get("/single-menu-detail/:id", async (req, res) => {
  try {
    const { id } = req.params;
    const menuDetail = await getSingleMenuDetail(id);
    res.status(200).json(menuDetail);
  } catch (err) {
    console.error("fetching error,", err);
    res
      .status(500)
      .json({ message: "Something went wrong while loading the menu." });
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
      const result = await updateMenuField(menuId, column, value);

      if (result.rowCount === 0) {
        return res.status(404).json({
          message: "Menu not found.",
        });
      }

      res.status(200).json({ success: true });
    } catch (err) {
      console.error("DB update error:", err);
      res.status(500).json({
        message:
          "Something went wrong while updating the requested menu field.",
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
      const imgSrc = req.file.path;
      const imgPublicId = req.file.filename;

      const menuInfo = await getSingleMenuDetail(menuId);

      if (!menuInfo) {
        await cloudinary.uploader.destroy(imgPublicId).catch(() => {});
        return res.status(404).json({ message: "Menu not found." });
      } // DB에 존재하지 않는 메뉴라면 클라우드에 올려진 이미지 삭제

      const result = await updateMenuImage(menuId, imgSrc, imgPublicId);

      if (result.rowCount === 0) {
        await cloudinary.uploader.destroy(imgPublicId).catch(() => {});
        return res.status(404).json({
          message: "Menu not found.",
        });
      } // DB 업데이트 중, 없는 메뉴였다면 클라우드에 올려진 이미지 삭제

      if (menuInfo.image_public_id) {
        await cloudinary.uploader
          .destroy(menuInfo.image_public_id)
          .catch(() => {});
      } // 새 이미지가 올라갔으므로 기존 이미지는 삭제

      res
        .status(200)
        .json({ message: "A new image is uploaded successfully." });
    } catch (err) {
      if (req.file?.filename) {
        await cloudinary.uploader.destroy(req.file.filename).catch(() => {});
      }

      console.error("Menu update error:", err);
      res
        .status(500)
        .json({ message: "Something went wrong while uploading the image." });
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
      const { name, price, description } = req.body;
      const imgSrc = req.file.path;
      const imgPublicId = req.file.filename;
      await createMenu({ name, price, description, imgSrc, imgPublicId });
      res.status(200).json({ message: "A new menu is uploaded successfully." });
    } catch (err) {
      if (req.file?.filename) {
        await cloudinary.uploader.destroy(req.file.filename).catch(() => {});
      }

      if (err.code === "23505") {
        return res
          .status(409)
          .json({ message: "A menu with this name already exists." });
      }

      console.error("Menu upload error,", err);
      res
        .status(500)
        .json({ message: "Something went wrong while uploading the menu." });
    }
  },
);

router.delete("/delete/:menuId", verifyAdminAuth, async (req, res) => {
  const client = await pool.connect();

  try {
    await client.query("BEGIN");
    const { menuId } = req.params;
    const menuInfo = await getSingleMenuDetail(menuId, client);

    if (!menuInfo) {
      await client.query("ROLLBACK");
      return res.status(404).json({ message: "Menu not found." });
    }

    const deletedCount = await deleteMenu(menuId, client);

    if (deletedCount === 0) {
      await client.query("ROLLBACK");
      return res.status(409).json({ message: "Menu could not be deleted." });
    }

    await client.query("COMMIT");
    await cloudinary.uploader.destroy(menuInfo.image_public_id).catch((err) => {
      console.error(`Cloudinary cleanup failed for menu ${menuId}:`, err);
    });

    res.status(200).json({ message: "Menu deleted successfully." });
  } catch (err) {
    await client.query("ROLLBACK").catch(() => {});
    console.error("Menu delete error,", err);
    res
      .status(500)
      .json({ message: "Something went wrong while deleting the menu." });
  } finally {
    client.release();
  }
});

export default router;
