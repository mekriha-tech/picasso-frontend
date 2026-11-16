const PRODUCTION_BACKEND = "https://picasso-backend-production.up.railway.app";
const STAGING_BACKEND = "https://picasso-backend-staging.up.railway.app";

// Which backend this build talks to. Production is never the silent default:
//   1. BACKEND_URL, if set (local .env.local, or Netlify per-context env in netlify.toml / UI)
//   2. the Netlify production deploy (CONTEXT=production) -> production backend
//   3. anything else (local dev, branch deploys, deploy previews) -> staging
function resolveBackend() {
  if (process.env.BACKEND_URL) return { url: process.env.BACKEND_URL.replace(/\/+$/, ""), why: "BACKEND_URL" };
  if (process.env.CONTEXT === "production") return { url: PRODUCTION_BACKEND, why: "Netlify production" };
  return { url: STAGING_BACKEND, why: `default for ${process.env.CONTEXT ?? "local"}` };
}

const backend = resolveBackend();
// Printed once per build/dev start so a misconfigured deploy is visible in the log.
if (process.env.NEXT_PHASE !== "phase-production-server") {
  console.log(`[picasso] API backend: ${backend.url} (${backend.why})`);
}

module.exports = {
  // Inlined at build time; server-side fetches read it (see src/lib/auth-api.js).
  env: { BACKEND_URL: backend.url },
  // Proxy the API through our own origin so the backend's refresh cookie is first-party
  // (SameSite=Lax cookies are not sent on cross-site fetches). Works on any host.
  async rewrites() {
    return [{ source: "/api/:path*", destination: `${backend.url}/api/:path*` }];
  },
};
