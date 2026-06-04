export function parseCursor(cursorString) {
  if (!cursorString) return null;

  try {
    const cursor = JSON.parse(cursorString);

    const isValidDate =
      typeof cursor.created_at == "string" &&
      !Number.isNaN(Date.parse(cursor.created_at));

    if (!isValidDate || !Number.isInteger(cursor.id)) {
      return null;
    }

    return cursor;
  } catch {
    return null;
  }
}
