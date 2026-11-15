export const DEFAULT_AFTER_LOGIN = "/home";

// Only same-site relative paths are accepted, so ?next= can't be used as an open redirect.
function safeNext(raw) {
  if (typeof raw !== "string") return null;
  if (raw === "/" || !raw.startsWith("/") || raw.startsWith("//") || raw.startsWith("/\\")) return null;
  return raw;
}

export function loginPath(next) {
  return `/login?next=${encodeURIComponent(next)}`;
}

// Where to go after a successful login or signup: the ?next= the visitor came with, else home.
export function postLoginPath() {
  if (typeof window === "undefined") return DEFAULT_AFTER_LOGIN;
  const next = new URLSearchParams(window.location.search).get("next");
  return safeNext(next) ?? DEFAULT_AFTER_LOGIN;
}

// "&next=..." (or "") so the signup page can keep the destination across the email step.
export function forwardNextParam() {
  if (typeof window === "undefined") return "";
  const next = safeNext(new URLSearchParams(window.location.search).get("next"));
  return next ? `&next=${encodeURIComponent(next)}` : "";
}
