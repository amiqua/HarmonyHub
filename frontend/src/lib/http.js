import axios from "axios";
import { toast } from "sonner";

// Use /api/v1 for dev (Vite proxy handles forwarding to http://localhost:3000)
// In production, API_BASE_URL should be the full URL to backend
const baseURL = import.meta.env.VITE_API_BASE_URL?.trim() || "/api/v1";

console.log("[http] Initialized with baseURL:", {
  baseURL,
  mode: import.meta.env.MODE,
  viteApiBaseUrl: import.meta.env.VITE_API_BASE_URL,
});

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
    console.log("[http] Adding Authorization header:", {
      endpoint: config.url,
      hasToken: !!token,
      tokenLength: token.length,
      tokenPreview: token.substring(0, 20) + "...",
    });
  } else {
    console.log("[http] No accessToken in localStorage for endpoint:", config.url);
  }
  
  // Log the full URL being requested
  console.log("[http] Request URL construction:", {
    baseURL: config.baseURL,
    endpoint: config.url,
    fullURL: `${config.baseURL}${config.url}`,
  });
  
  return config;
});

// Centralized error handling
http.interceptors.response.use(
  (res) => {
    console.log("[http] Response received:", {
      status: res.status,
      url: res.config.url,
      method: res.config.method,
    });
    return res;
  },
  (err) => {
    const message =
      err?.response?.data?.message ||
      err?.message ||
      "Có lỗi xảy ra, vui lòng thử lại";
    const status = err?.response?.status;

    // DEBUG: Log response errors with details
    console.error("[http] Response error:", {
      message,
      status,
      url: err?.config?.url,
      method: err?.config?.method,
      baseURL: err?.config?.baseURL,
      fullURL: err?.config?.url ? `${err?.config?.baseURL}${err?.config?.url}` : "unknown",
      responseData: err?.response?.data,
      errorType: err?.code, // e.g., ERR_NETWORK, ERR_CONNECTION_REFUSED
    });

    // Show error toast
    if (err?.response) {
      toast.error(message);
    } else if (err?.request) {
      toast.error("Không thể kết nối đến server");
      console.error("[http] No response from server:", {
        requestUrl: err.config?.url,
        baseURL: err.config?.baseURL,
        code: err.code,
        message: err.message,
      });
    } else {
      toast.error(message);
    }

    return Promise.reject(err);
  }
);
