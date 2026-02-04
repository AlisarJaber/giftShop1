import axios from "axios";

const API_KEY = "SEACRET1234567";

export const http = axios.create({
  baseURL: "http://localhost:8000",
  withCredentials: true,
});

/* =====================
   REQUEST INTERCEPTOR
===================== */
http.interceptors.request.use(
  (config) => {
    config.headers = config.headers || {};

    // api key (אחיד)
    config.headers["apiKey"] = API_KEY;

    return config;
  },
  (error) => Promise.reject(error)
);

/* =====================
   RESPONSE INTERCEPTOR
   (חשוב לאדמין + debug)
===================== */
http.interceptors.response.use(
  (response) => response,
  (error) => {
    // אם יש תשובה מהשרת – נדפיס אותה
    if (error?.response) {
      console.error(
        "API ERROR:",
        error.response.status,
        error.response.data
      );
    } else {
      console.error("NETWORK / SERVER ERROR:", error.message);
    }

    return Promise.reject(error);
  }
);
