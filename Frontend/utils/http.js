import axios from "axios";

export const http = axios.create({
  baseURL: "http://localhost:8000",
  withCredentials: true, 
  headers: {
    apikey: "SEACRET1234567",
  },
});

http.interceptors.request.use((config) => {
  config.headers = config.headers || {};
  config.headers["apikey"] = "SEACRET1234567";
  return config;
});





