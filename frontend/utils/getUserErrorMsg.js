export function getUserErrorMessage(err) {
  // Backend-provided, user-friendly message
  if (err?.response?.data?.error) {
    return err.response.data.error;
  }

  // Network error
  if (err?.code === "ERR_NETWORK") {
    return "Please check your network connection and try again.";
  }

  // Request canceled (e.g., page navigation)
  if (err?.name === "CanceledError") {
    return null; // Do not show anything to the user
  }

  // Fallback message
  return "Please try again shortly.";
}
