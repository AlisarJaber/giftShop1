import axios from "axios";
import toast from "react-hot-toast";

const API_KEY = "SEACRET1234567";

export const http = axios.create({
  baseURL: "http://localhost:8000",
  withCredentials: true,
});

/* =====================
   Helpers
===================== */
function clearClientAuth() {
  // In case you store anything locally (safe even if you don't)
  try {
    localStorage.removeItem("user");
    localStorage.removeItem("token");
    localStorage.removeItem("is_admin");
  } catch {}
}

function redirectToLogin() {
  // Avoid infinite redirects if already there
  if (window.location.pathname !== "/login") {
    window.location.href = "/login";
  }
}

/* =====================
   REQUEST INTERCEPTOR
===================== */
http.interceptors.request.use(
  (config) => {
    config.headers = config.headers || {};
    config.headers["apiKey"] = API_KEY;
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

    // Debug logs (keep)
    if (error?.response) {
      console.error("API ERROR:", status, error.response.data);
    } else {
      console.error("NETWORK / SERVER ERROR:", error.message);
    }

    // ✅ Blocked user: force logout + redirect
    if (status === 403 && detail === "USER_BLOCKED") {
      clearClientAuth();

      // Try to clear the cookie session too (don't block redirect if fails)
      try {
        await axios.post(
          "http://localhost:8000/auth/logout",
          {},
          { withCredentials: true, headers: { apiKey: API_KEY } }
        );
      } catch {}

      toast.error("Your account is blocked.");
      redirectToLogin();

      return Promise.reject(error);
    }

    // Optional: if not logged in anymore -> redirect to login
    if (status === 401) {
      // Don't spam toast here; user might just be unauthenticated
      clearClientAuth();
      redirectToLogin();
      return Promise.reject(error);
    }

    return Promise.reject(error);
  }
);