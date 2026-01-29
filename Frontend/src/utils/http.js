import axios from "axios";

const API_KEY = "SEACRET1234567";

export const http = axios.create({
  baseURL: "http://localhost:8000",   
  withCredentials: true,
});

http.interceptors.request.use((config) => {
  config.headers = config.headers || {};
  config.headers["apikey"] = API_KEY;
  config.headers["apiKey"] = API_KEY;
  return config;
});








