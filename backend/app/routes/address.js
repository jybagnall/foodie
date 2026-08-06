import express from "express";
import pool from "../config/db.js";
import { verifyUserAuth } from "../middleware/auth.middleware.js";
import { validateBody } from "../middleware/validateBody.js";
import { withTransaction } from "../utils/db.js";
import {
  createUserAddress,
  getAllAddresses,
  getDefaultAddress,
  clearDefaultAddress,
  deleteAddress,
  updateUserAddress,
  setAddressAsDefault,
} from "../services/address-service.js";

const router = express.Router();

router.get("/all", verifyUserAuth, async (req, res, next) => {
  try {
    const addresses = await getAllAddresses(req.user.id);
    res.status(200).json(addresses);
  } catch (err) {
    return next(err);
  }
});

// 기본 배송지가 있을 수도, 없을 수도 있고 없다해도 에러는 아님. 그래서 200
router.get("/default", verifyUserAuth, async (req, res, next) => {
  try {
    const address = await getDefaultAddress(req.user.id);
    res.status(200).json(address);
  } catch (err) {
    return next(err);
  }
});

router.patch(
  "/edit/:addressId",
  verifyUserAuth,
  validateBody(
    "full_name",
    "street",
    "city",
    "state",
    "postal_code",
    "phone",
    "is_default",
  ),
  async (req, res, next) => {
    try {
      const payload = req.body;
      const { addressId } = req.params;

      await withTransaction(pool, async (client) => {
        if (payload.is_default) {
          await clearDefaultAddress(client, req.user.id);
        }
        await updateUserAddress(client, payload, addressId, req.user.id);
      });

      res
        .status(200)
        .json({ message: "User's address is successfully updated" });
    } catch (err) {
      console.error("update error,", err);
      return next(err);
    }
  },
);

router.patch(
  "/set-default/:addressId",
  verifyUserAuth,
  async (req, res, next) => {
    try {
      const { addressId } = req.params;

      await withTransaction(pool, async (client) => {
        await clearDefaultAddress(client, req.user.id);
        await setAddressAsDefault(client, req.user.id, addressId);
      });

      res.status(200).json({ message: "Default is updated" });
    } catch (err) {
      console.error("update error,", err);
      return next(err);
    }
  },
);

router.post(
  "/create",
  verifyUserAuth,
  validateBody(
    "full_name",
    "street",
    "city",
    "state",
    "postal_code",
    "phone",
    "is_default",
  ),
  async (req, res, next) => {
    try {
      const payload = req.body;

      await withTransaction(pool, async (client) => {
        if (payload.is_default) {
          await clearDefaultAddress(client, req.user.id);
        }
        await createUserAddress(client, payload, req.user.id);
      });

      res.status(201).json({ message: "Address created" });
    } catch (err) {
      console.error("create error,", err);
      return next(err);
    }
  },
);

router.patch("/delete/:addressId", verifyUserAuth, async (req, res, next) => {
  const { addressId } = req.params;
  try {
    await deleteAddress(req.user.id, addressId);
    res.status(200).json({ message: "Address deleted" });
  } catch (err) {
    return next(err);
  }
});

export default router;
