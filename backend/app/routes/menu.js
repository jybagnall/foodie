import express from "express";
import { getMenu } from "../services/menu-service.js";

const router = express.Router();

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

export default router;
