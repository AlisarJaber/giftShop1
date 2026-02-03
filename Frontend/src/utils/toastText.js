export function getErrorText(err, fallback = "Something went wrong") {
  const data = err?.response?.data;

  // =========================
  // 1. detail כ־string
  // =========================
  if (typeof data?.detail === "string") {
    const msg = data.detail.toLowerCase();

    // Email validation
    if (msg.includes("email")) {
      return "Please enter a valid email address.";
    }

    // Login / credentials
    if (
      msg.includes("invalid") ||
      msg.includes("incorrect") ||
      msg.includes("credentials")
    ) {
      return "Invalid email or password.";
    }

    // Fallback לטקסט המקורי אם אין התאמה
    return data.detail;
  }

  // =========================
  // 2. FastAPI 422 (array)
  // =========================
  if (Array.isArray(data?.detail)) {
    const first = data.detail[0];
    const rawMsg = first?.msg?.toLowerCase() || "";
    const locArr = Array.isArray(first?.loc) ? first.loc : [];
    const field = locArr[locArr.length - 1]; // email / password וכו'

    if (field === "email") {
      return "Please enter a valid email address.";
    }

    if (field === "password") {
      return "Please enter a valid password.";
    }

    return "Please check your input and try again.";
  }

  // =========================
  // 3. detail כ־object
  // =========================
  if (data?.detail && typeof data.detail === "object") {
    return fallback;
  }

  // =========================
  // 4. message רגיל
  // =========================
  if (typeof data?.message === "string") {
    return data.message;
  }

  // =========================
  // 5. Axios error
  // =========================
  if (typeof err?.message === "string") {
    return err.message;
  }

  return fallback;
}
