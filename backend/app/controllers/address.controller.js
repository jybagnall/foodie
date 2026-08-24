import pool from "../config/db.js";
import { ADDRESS_ERROR } from "../constants/errors.js";
import {
  clearDefaultAddress,
  createUserAddress,
  setAddressAsDefault,
  updateUserAddress,
} from "../services/address-service.js";
import { withTransaction } from "../utils/db.js";

export async function editAddress(userId, addressId, payload) {
  await withTransaction(pool, async (client) => {
    if (payload.is_default) {
      await clearDefaultAddress(client, userId);
    }
    await updateUserAddress(client, payload, addressId, userId);
  });
}

export async function createAddress(userId, payload) {
  try {
    await withTransaction(pool, async (client) => {
      if (payload.is_default) {
        await clearDefaultAddress(client, userId);
      }
      await createUserAddress(client, payload, userId);
    });
  } catch (err) {
    if (err.code === "23505") {
      throw new Error(ADDRESS_ERROR.ADDRESS_ALREADY_EXISTS, { cause: err });
    }
    throw err;
  }
}

export async function setDefaultAddress(userId, addressId) {
  await withTransaction(pool, async (client) => {
    await clearDefaultAddress(client, userId);
    await setAddressAsDefault(client, userId, addressId);
  });
}
