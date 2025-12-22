import axios from "axios";

const baseURL = import.meta.env.VITE_API_BASE_URL?.trim() || ""; // "" => dùng Vite proxy (/api -> backend)

export const http = axios.create({
  baseURL,
  timeout: Number(import.meta.env.VITE_API_TIMEOUT ?? 15000),
  withCredentials: false, // JWT header => false
});

// Gắn Bearer token
http.interceptors.request.use((config) => {
  const token = localStorage.getItem("accessToken");
  if (token) {
    config.headers = config.headers ?? {};
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Log lỗi tập trung
http.interceptors.response.use(
  (res) => res,
  (err) => {
    console.error("[http] Request failed:", {
      message: err?.message,
      url: err?.config?.url,
      method: err?.config?.method,
      status: err?.response?.status,
      data: err?.response?.data,
      baseURL: err?.config?.baseURL,
    });
    return Promise.reject(err);
  }
);
