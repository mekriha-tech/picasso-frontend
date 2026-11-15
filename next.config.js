const BACKEND_URL =
  process.env.BACKEND_URL ?? "https://picasso-backend-production.up.railway.app";

module.exports = {
  // Proxy the API through our own origin so the backend's refresh cookie is first-party
  // (SameSite=Lax cookies are not sent on cross-site fetches). Works on any host.
  async rewrites() {
    return [
      { source: "/api/:path*", destination: `${BACKEND_URL}/api/:path*` },
    ];
  },
};
