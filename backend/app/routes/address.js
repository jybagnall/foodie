import express from "express";
import { verifyUserAuth } from "../middleware/auth.middleware.js";
import {
  getAllAddresses,
  getDefaultAddress,
} from "../services/address-service.js";
import pool from "../config/db.js";

const router = express.Router();

router.get("/all", verifyUserAuth, async (req, res) => {
  try {
    const addresses = await getAllAddresses(req.user.id);
    res.status(200).json(addresses);
  } catch (err) {
    console.error("fetching error,", err.message);
    res
      .status(500)
      .json({ error: "Something went wrong while loading the data." });
  }
});

// 기본 배송지가 있을 수도, 없을 수도 있고 없다해도 에러는 아님. 그래서 200
router.get("/default", verifyUserAuth, async (req, res) => {
  try {
    const address = await getDefaultAddress(req.user.id);
    res.status(200).json(address);
  } catch (err) {
    console.error("fetching error,", err.message);
    res
      .status(500)
      .json({ error: "Something went wrong while loading the data." });
  }
});

export default router;
