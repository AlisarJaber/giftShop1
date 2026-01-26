import axios from "axios";

export const http = axios.create({
  baseURL: "http://127.0.0.1:8000",
  withCredentials: true,
})

http.interceptors.request.use((config) => {
  config.headers.apiKey = "SEACRET1234567";
  return config;
})
