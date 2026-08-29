export const authEvents = new EventTarget();

export const emitTokenRefreshed = (newToken) => {
  authEvents.dispatchEvent(
    new CustomEvent("tokenRefreshed", { detail: newToken }),
  );
};

export const emitSessionExpired = () => {
  authEvents.dispatchEvent(new CustomEvent("sessionExpired"));
};
