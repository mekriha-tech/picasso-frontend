// Browser calls go to our own origin (/api/* is proxied to the backend by next.config.js) so the
// refresh cookie is first-party. Server-side fetches have no origin, so they hit the backend directly.
export const API_BASE_URL =
  typeof window === "undefined"
    ? (process.env.BACKEND_URL ?? "https://picasso-backend-production.up.railway.app")
    : "";

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

export async function request(
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
    const error = new Error(detail);
    error.status = res.status;
    throw error;
  }

  return data;
}

// The access token lives 15 minutes. Refresh once (via the httpOnly refresh cookie) when an
// authenticated call comes back 401, then retry; if the refresh fails the session is over.
export async function refreshSession() {
  const data = await request("/api/v1/auth/refresh", {});
  setAccessToken(data.access_token);
  return data.access_token;
}

export async function authedRequest(path, options = {}) {
  try {
    return await request(path, { ...options, auth: true });
  } catch (err) {
    if (err?.status !== 401) throw err;
    try {
      await refreshSession();
    } catch {
      clearAccessToken();
      throw err;
    }
    return request(path, { ...options, auth: true });
  }
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
  return authedRequest("/api/v1/auth/me", { method: "GET" });
}

export function logout() {
  return request("/api/v1/auth/logout", {});
}