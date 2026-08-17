import { BRAND_ASSET_KEYS } from "../constants/brandAssets.js";
import { uploadImage } from "../services/brand-service.js";
import { cleanupCloudinaryAsset } from "../utils/cloudinary.js";

export async function uploadBrandAsset(assetType, file) {
  const key = BRAND_ASSET_KEYS[assetType];

  if (!key) {
    await cleanupCloudinaryAsset(file.filename, "invalid asset type");

    throw new Error("INVALID_ASSET_TYPE");
  }

  const imgSrc = file.path;
  const imgPublicId = file.filename;
  let oldPublicId;

  try {
    oldPublicId = await uploadImage({ key, imgSrc, imgPublicId });
  } catch (err) {
    await cleanupCloudinaryAsset(imgPublicId, "Logo update failed");

    throw err;
  }

  // 기존 이미지의 ID 를 삭제
  if (oldPublicId) {
    await cleanupCloudinaryAsset(oldPublicId, "Replacing old brand logo");
  }
}
