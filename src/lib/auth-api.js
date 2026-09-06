export const API_BASE_URL =
  "https://picasso-backend-production.up.railway.app";

const TOKEN_KEY = "picasso_access_token";

export function getAccessToken() {
  if (typeof window === "undefined") return null;
  return window.localStorage.getItem(TOKEN_KEY);
}

export function setAccessToken(token) {
  if (typeof window === "undefined") return;
  window.localStorage.setItem(TOKEN_KEY, token);
}

export function clearAccessToken() {
  if (typeof window === "undefined") return;
  window.localStorage.removeItem(TOKEN_KEY);
}

async function request(
  path,
  options = {},
) {
  const headers = {
    "Content-Type": "application/json",
  };
  if (options.auth) {
    const token = getAccessToken();
    if (token) headers["Authorization"] = `Bearer ${token}`;
  }

  let res;
  try {
    res = await fetch(`${API_BASE_URL}${path}`, {
      method: options.method ?? "POST",
      headers,
      credentials: "include",
      ...(options.body === undefined
        ? {}
        : { body: JSON.stringify(options.body) }),
    });
  } catch {
    throw new Error("Network error. Please check your connection.");
  }

  let data = null;
  try {
    data = await res.json();
  } catch {
    data = null;
  }

  if (!res.ok) {
    const detail =
      data && typeof data === "object" && "detail" in data
        ? String((data).detail)
        : "Something went wrong. Please try again.";
    throw new Error(detail);
  }

  return data;
}

export function checkEmail(email) {
  return request("/api/v1/auth/check-email", {
    body: { email },
  });
}

export function login(email, password) {
  return request("/api/v1/auth/login", {
    body: { email, password },
  });
}

export function register(email, password, fullName) {
  return request("/api/v1/auth/register", {
    body: { email, password, full_name: fullName },
  });
}

export function getMe() {
  return request("/api/v1/auth/me", { method: "GET", auth: true });
}

export function logout() {
  return request("/api/v1/auth/logout", {});
}