import { http } from "@/lib/http";

export async function login({ email, password }) {
  const res = await http.post("/auth/login", { email, password });
  return res.data.data; // { user, tokens: { accessToken, refreshToken? } }
}

export async function getMe() {
  const res = await http.get("/auth/me");
  return res.data.data; // { user }
}

export async function refreshAccessToken(refreshToken) {
  const res = await http.post("/auth/refresh", { refreshToken });
  return res.data.data; // { accessToken }
}

export async function register({ email, password, username }) {
  const res = await http.post("/auth/register", { email, password, username });
  return res.data.data; // thường trả { user, tokens? } hoặc { user }
}
