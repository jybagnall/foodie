import express from "express";
import { verifyUserAuth } from "../middleware/auth.middleware.js";
import { validateBody } from "../middleware/validateBody.js";
import {
  getAllAddresses,
  getDefaultAddress,
  deleteAddress,
} from "../services/address-service.js";
import {
  createAddress,
  editAddress,
  setDefaultAddress,
} from "../controllers/address.controller.js";
import { ADDRESS_ERROR_STATUS } from "../constants/errors.js";

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
  async (req, res) => {
    try {
      const payload = req.body;
      const { addressId } = req.params;
      await editAddress(req.user.id, addressId, payload);
      res
        .status(200)
        .json({ message: "User's address is successfully updated" });
    } catch (err) {
      console.error("update error,", err);
      const status = ADDRESS_ERROR_STATUS[err.message] ?? 500;
      return res.status(status).json({
        error:
          status === 404
            ? "Address not found."
            : "Failed to update user address.",
      });
    }
  },
);

router.patch("/set-default/:addressId", verifyUserAuth, async (req, res) => {
  try {
    const { addressId } = req.params;
    await setDefaultAddress(req.user.id, addressId);
    res.status(200).json({ message: "Default is updated" });
  } catch (err) {
    console.error("update error,", err);
    const status = ADDRESS_ERROR_STATUS[err.message] ?? 500;
    return res.status(status).json({
      error:
        status === 404
          ? "Address not found."
          : "Failed to update default address.",
    });
  }
});

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
  async (req, res) => {
    try {
      const payload = req.body;
      await createAddress(req.user.id, payload);
      res.status(201).json({ message: "Address created" });
    } catch (err) {
      console.error("create error,", err);
      const status = ADDRESS_ERROR_STATUS[err.message] ?? 500;
      return res.status(status).json({
        error: "Failed to create user address.",
      });
    }
  },
);

router.patch("/delete/:addressId", verifyUserAuth, async (req, res) => {
  const { addressId } = req.params;
  try {
    await deleteAddress(req.user.id, addressId);
    res.status(200).json({ message: "Address deleted" });
  } catch (err) {
    console.error("Delete address error:", err);
    const status = ADDRESS_ERROR_STATUS[err.message] ?? 500;
    return res.status(status).json({
      error:
        status === 404
          ? "Address not found."
          : "Failed to delete user address.",
    });
  }
});

export default router;
