import { API_BASE_URL } from "./auth-api";

// Server-side fetches for the public landing page. These carry no token, so they always get
// the logged-out teaser - which is exactly what that page shows. Cached briefly so the page is
// fast and the backend is not hit on every visit.
async function fetchPublic(path, revalidateSeconds = 60) {
  try {
    const res = await fetch(`${API_BASE_URL}${path}`, { next: { revalidate: revalidateSeconds } });
    if (!res.ok) return null;
    return await res.json();
  } catch {
    return null;
  }
}

// Any piece can be null if the API is unreachable; the page renders its empty states then.
export async function getLandingData() {
  const [featured, artworks, artists] = await Promise.all([
    fetchPublic("/api/v1/artworks/featured"),
    fetchPublic("/api/v1/artworks?limit=12"),
    fetchPublic("/api/v1/artists?limit=6"),
  ]);
  return { featured, artworks, artists };
}
