import { authedRequest, initSession, request } from "./auth-api";

function withQuery(path, params = {}) {
  const search = new URLSearchParams();
  for (const [key, value] of Object.entries(params)) {
    if (value !== undefined && value !== null && value !== "") search.set(key, String(value));
  }
  const query = search.toString();
  return query ? `${path}?${query}` : path;
}

// Logged in -> send the token and the backend returns the full catalogue. Logged out -> no
// token, and the backend returns only the teaser (the limit is enforced server-side; see the
// backend docs/API_REFERENCE.md "Public catalogue").
async function get(path, params) {
  const url = withQuery(path, params);
  // Wait for a possible session restore so a reload does not briefly show the logged-out teaser.
  return (await initSession()) ? authedRequest(url, { method: "GET" }) : request(url, { method: "GET" });
}

export const getFeatured = () => get("/api/v1/artworks/featured");
export const listArtworks = (params) => get("/api/v1/artworks", params);
export const getArtwork = (slug) => get(`/api/v1/artworks/${encodeURIComponent(slug)}`);
export const listArtists = (params) => get("/api/v1/artists", params);
export const getArtist = (slug) => get(`/api/v1/artists/${encodeURIComponent(slug)}`);
