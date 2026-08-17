import { cloudinary } from "../config/cloudinary.js";

export async function cleanupCloudinaryAsset(publicId, reason) {
  if (!publicId) return;

  await cloudinary.uploader.destroy(publicId).catch((cleanupErr) => {
    console.error(
      `Failed to clean up Cloudinary asset ${publicId}. Reason: ${reason}`,
      cleanupErr,
    );
  });
}
