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

// client
router.patch("/edit/:addressId", verifyUserAuth, async (req, res) => {
  const client = await pool.connect();
  try {
    const { addressId } = req.params;
    const { formData } = req.body;
    await client.query("BEGIN");
    // logic
    await client.query("COMMIT");
    res.status(200).json({ message: "", orderId });
  } catch (err) {
    console.error("update error,", err.message);
    await client.query("ROLLBACK");
  } finally {
    client.release();
  }
});

router.post("/create", verifyUserAuth, async (req, res) => {
  const client = await pool.connect();
  try {
    const { formData } = req.body;
    await client.query("BEGIN");
    // logic
    await client.query("COMMIT");
    res.status(200).json({ message: "", orderId });
  } catch (err) {
    console.error("update error,", err.message);
    await client.query("ROLLBACK");
  } finally {
    client.release();
  }
});

router.delete("/delete/:addressId", verifyUserAuth, async (req, res) => {
  const { addressId } = req.params;
  try {
    // await deleteAddress(req.user.id, addressId);
  } catch (err) {
    console.error("update error,", err.message);
  }
});

export default router;
