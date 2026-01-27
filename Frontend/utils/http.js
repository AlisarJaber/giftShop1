import axios from "axios";

export const http = axios.create({
  baseURL: "http://localhost:8000",
  withCredentials: true,
});

http.interceptors.request.use((config) => {
  config.headers.apiKey = "SEACRET1234567";
  const token = localStorage.getItem("token");
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }

  return config;
})

