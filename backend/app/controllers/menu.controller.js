import { MENU_ERROR } from "../constants/errors.js";
import {
  createMenu,
  deleteMenu,
  getSingleMenuDetail,
  updateMenuField,
  updateMenuImage,
} from "../services/menu-service.js";
import { cleanupCloudinaryAsset } from "../utils/cloudinary.js";

export async function createNewMenu({ file, name, price, description }) {
  const imgSrc = file.path;
  const imgPublicId = file.filename;

  try {
    await createMenu({ name, price, description, imgSrc, imgPublicId });
  } catch (err) {
    await cleanupCloudinaryAsset(imgPublicId, "menu creation failed");

    if (err.code === "23505") {
      throw new Error(MENU_ERROR.MENU_ALREADY_EXISTS, { cause: err });
    }

    throw err;
  }
}

export async function deleteMenuById(client, menuId) {
  let menuInfo;

  try {
    await client.query("BEGIN");
    menuInfo = await getSingleMenuDetail(menuId, client);

    if (!menuInfo) {
      throw new Error(MENU_ERROR.MENU_NOT_FOUND);
    }

    await deleteMenu(menuId, client);
    await client.query("COMMIT");
    await cleanupCloudinaryAsset(menuInfo.image_public_id, "deleting menu");
  } catch (err) {
    await client.query("ROLLBACK").catch(() => {});
    throw err;
  }
}

export async function updateMenu({ menuId, column, value }) {
  const result = await updateMenuField(menuId, column, value);

  if (result.rowCount === 0) {
    throw new Error(MENU_ERROR.MENU_NOT_FOUND);
  }
}

export async function updateMenuImageByMenuId(file, menuId) {
  const imgSrc = file.path;
  const imgPublicId = file.filename;
  const menuInfo = await getSingleMenuDetail(menuId);

  // DB에 존재하지 않는 메뉴라면 클라우드에 올려진 이미지 삭제
  if (!menuInfo) {
    await cleanupCloudinaryAsset(imgPublicId, "menu does not exist in DB");

    throw new Error(MENU_ERROR.MENU_NOT_FOUND);
  }

  try {
    const result = await updateMenuImage(menuId, imgSrc, imgPublicId);

    // DB 업데이트 중, 없는 메뉴였다면 클라우드에 올려진 이미지 삭제
    if (result.rowCount === 0) {
      throw new Error(MENU_ERROR.MENU_NOT_FOUND);
    }
  } catch (err) {
    // DB에서 사용되지 않는 새 이미지를 삭제
    await cleanupCloudinaryAsset(imgPublicId, "menu image update failed");

    throw err;
  }

  // 새 이미지가 올라갔으므로 기존 이미지는 삭제
  if (menuInfo.image_public_id) {
    await cleanupCloudinaryAsset(
      menuInfo.image_public_id,
      "replacing old menu image",
    );
  }
}
