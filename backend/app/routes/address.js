import express from "express";
import { verifyUserAuth } from "../middleware/auth.middleware.js";
import {
  createUserAddress,
  getAllAddresses,
  getDefaultAddress,
  clearDefaultAddress,
  deleteAddress,
  updateUserAddress,
  setAddressAsDefault,
} from "../services/address-service.js";
import pool from "../config/db.js";

const router = express.Router();

router.get("/all", verifyUserAuth, async (req, res) => {
  try {
    const addresses = await getAllAddresses(req.user.id);
    res.status(200).json(addresses);
  } catch (err) {
    console.error("fetching error,", err.message);
    res.status(500).json({ error: err.message });
  }
});

// 기본 배송지가 있을 수도, 없을 수도 있고 없다해도 에러는 아님. 그래서 200
router.get("/default", verifyUserAuth, async (req, res) => {
  try {
    const address = await getDefaultAddress(req.user.id);
    res.status(200).json(address);
  } catch (err) {
    console.error("fetching error,", err.message);
    res.status(500).json({ error: err.message });
  }
});

router.patch("/edit/:addressId", verifyUserAuth, async (req, res) => {
  const client = await pool.connect();
  try {
    const payload = req.body;
    const { addressId } = req.params;
    await client.query("BEGIN");

    if (payload.is_default) {
      await clearDefaultAddress(client, req.user.id);
    }
    await updateUserAddress(client, payload, addressId, req.user.id);
    await client.query("COMMIT");
    res.status(200).json({ message: "User's address is successfully updated" });
  } catch (err) {
    console.error("update error,", err.message);
    await client.query("ROLLBACK").catch(() => {});
    res.status(500).json({ error: err.message });
  } finally {
    client.release();
  }
});

router.patch("/set-default/:addressId", verifyUserAuth, async (req, res) => {
  const client = await pool.connect();
  try {
    const { addressId } = req.params;
    await client.query("BEGIN");
    await clearDefaultAddress(client, req.user.id);
    await setAddressAsDefault(client, req.user.id, addressId);
    await client.query("COMMIT");
    res.status(200).json({ message: "Default is updated" });
  } catch (err) {
    console.error("update error,", err.message);
    await client.query("ROLLBACK").catch(() => {});
    res.status(500).json({ error: err.message });
  } finally {
    client.release();
  }
});

router.post("/create", verifyUserAuth, async (req, res) => {
  const client = await pool.connect();
  try {
    const payload = req.body;
    await client.query("BEGIN");

    if (payload.is_default) {
      await clearDefaultAddress(client, req.user.id);
    }
    await createUserAddress(client, payload, req.user.id);
    await client.query("COMMIT");
    res.status(201).json({ message: "Address created" });
  } catch (err) {
    console.error("create error,", err.message);
    await client.query("ROLLBACK").catch(() => {});
    res.status(500).json({ error: err.message });
  } finally {
    client.release();
  }
});

router.delete("/delete/:addressId", verifyUserAuth, async (req, res) => {
  const { addressId } = req.params;
  try {
    await deleteAddress(req.user.id, addressId);
    res.status(200).json({ message: "Address deleted" });
  } catch (err) {
    console.error("update error,", err.message);
    res.status(500).json({ error: err.message });
  }
});

export default router;
