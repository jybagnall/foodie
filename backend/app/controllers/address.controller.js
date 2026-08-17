import pool from "../config/db.js";
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
  await withTransaction(pool, async (client) => {
    if (payload.is_default) {
      await clearDefaultAddress(client, userId);
    }
    await createUserAddress(client, payload, userId);
  });
}

export async function setDefaultAddress(userId, addressId) {
  await withTransaction(pool, async (client) => {
    await clearDefaultAddress(client, userId);
    await setAddressAsDefault(client, userId, addressId);
  });
}
