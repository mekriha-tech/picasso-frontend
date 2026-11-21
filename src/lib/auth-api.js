// Browser calls go to our own origin (/api/* is proxied to the backend by next.config.js) so the
// refresh cookie is first-party. Server-side fetches have no origin, so they hit the backend directly.
// BACKEND_URL is resolved once in next.config.js (staging unless it is the production deploy).
export const API_BASE_URL = typeof window === "undefined" ? process.env.BACKEND_URL : "";

// The access token lives in memory only, so an XSS bug cannot read it from storage. After a
// reload it is restored from the httpOnly refresh cookie via /auth/refresh (see initSession).
// localStorage holds only a non-secret hint that a session may exist, so visitors who never
// logged in do not hit /auth/refresh on every page load.
const SESSION_HINT_KEY = "picasso_has_session";
const LEGACY_TOKEN_KEY = "picasso_access_token";

let accessToken = null;
let restoring = null;

function storage() {
  if (typeof window === "undefined") return null;
  try {
    return window.localStorage;
  } catch {
    return null;
  }
}

export function getAccessToken() {
  return accessToken;
}

export function setAccessToken(token) {
  accessToken = token;
  storage()?.setItem(SESSION_HINT_KEY, "1");
}

export function clearAccessToken() {
  accessToken = null;
  storage()?.removeItem(SESSION_HINT_KEY);
}

// Resolves to the access token, restoring it from the refresh cookie if needed, or null when
// logged out. Await this before deciding whether the visitor is logged in (page load, guards,
// gated actions). Concurrent callers share one refresh.
export function initSession() {
  if (accessToken) return Promise.resolve(accessToken);
  const store = storage();
  if (!store) return Promise.resolve(null);
  // One-off migration: drop a token left in localStorage by older versions.
  if (store.getItem(LEGACY_TOKEN_KEY) !== null) {
    store.removeItem(LEGACY_TOKEN_KEY);
    store.setItem(SESSION_HINT_KEY, "1");
  }
  if (!store.getItem(SESSION_HINT_KEY)) return Promise.resolve(null);
  restoring ??= refreshSession()
    .catch((err) => {
      // Only a 401 means the session is really gone; a network error keeps the hint for next time.
      if (err?.status === 401) clearAccessToken();
      return null;
    })
    .finally(() => {
      restoring = null;
    });
  return restoring;
}

export async function request(
  path,
  options = {},
) {
  const headers = {
    "Content-Type": "application/json",
  };
  if (options.auth) {
    const token = await initSession();
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