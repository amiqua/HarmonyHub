import axios from "axios";

const BASE_URL =
  import.meta.env.MODE === "production"
    ? import.meta.env.VITE_API_BASE_URL
    : "http://localhost:3000/api";

export const api = axios.create({
  baseURL: BASE_URL,
  withCredentials: true,
});
