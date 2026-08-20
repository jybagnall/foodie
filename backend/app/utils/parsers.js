export function parsePositiveInt(value, errorCode) {
  const parsed = Number(value);
  if (!Number.isInteger(parsed) || parsed <= 0) {
    throw new Error(errorCode);
  }

  return parsed;
}

export function parseBoolean(value, errorCode) {
  if (typeof value !== "boolean") {
    throw new Error(errorCode);
  }
  return value;
}
