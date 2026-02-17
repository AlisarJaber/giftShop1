import axios from "axios";
import toast from "react-hot-toast";

export const http = axios.create({
  baseURL: "http://localhost:8000",
  withCredentials: true,
});

/* =====================
   Helpers
===================== */
function clearClientAuth() {
  try {
    localStorage.removeItem("user");
    localStorage.removeItem("token");
    localStorage.removeItem("is_admin");
  } catch {}
}

function redirectToLogin() {
  if (window.location.pathname !== "/login") {
    window.location.href = "/login";
  }
}

function hasLocalUser() {
  try {
    return !!JSON.parse(localStorage.getItem("user") || "null");
  } catch {
    return false;
  }
}

/* =====================
   REQUEST INTERCEPTOR
===================== */
http.interceptors.request.use(
  (config) => {
    // keep headers if exist, but don't inject secrets
    config.headers = config.headers || {};
    return config;
  },
  (error) => Promise.reject(error)
);

/* =====================
   RESPONSE INTERCEPTOR
===================== */
http.interceptors.response.use(
  (response) => response,
  async (error) => {
    const status = error?.response?.status;
    const detail = error?.response?.data?.detail;

    // Debug logs
    if (error?.response) {
      console.error("API ERROR:", status, error.response.data);
    } else {
      console.error("NETWORK / SERVER ERROR:", error.message);
    }

    // ✅ Blocked user: force logout + redirect
    if (status === 403 && detail === "USER_BLOCKED") {
      clearClientAuth();

      // try to clear cookie too
      try {
        await axios.post(
          "http://localhost:8000/auth/logout",
          {},
          { withCredentials: true }
        );
      } catch {}

      toast.error("Your account is blocked.");
      redirectToLogin();
      return Promise.reject(error);
    }

    /**
     * ✅ IMPORTANT FIX:
     * 401 is normal when you're not logged in (especially on /login or /signup).
     * So we DO NOT redirect on every 401.
     * We only redirect if there *was* a logged-in user locally.
     */
    if (status === 401) {
      if (hasLocalUser()) {
        clearClientAuth();
        redirectToLogin();
      }
      return Promise.reject(error);
    }

    return Promise.reject(error);
  }
);

export default http;