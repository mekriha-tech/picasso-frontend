# Picasso frontend — context for a new session

Art-auction + VR gallery marketplace. This repo is the web client; it consumes the backend API only.

- Frontend: Next.js 16.3.3 (App Router), React 19, Tailwind 4, plain JS. Hosted on Netlify (`https://picassofrontend.netlify.app`).
- Backend: FastAPI on Railway (`https://picasso-backend-production.up.railway.app`), repo `mekriha-tech/picasso-backend`.
- Contract: backend `docs/openapi.json` + `docs/API_REFERENCE.md` are the source of truth. Never guess an endpoint; if one is missing, open an issue labelled `needs-backend` in the backend repo (see backend `docs/COLLABORATION.md`).
- Agents: `.claude/agents/frontend-dev.md` for frontend work. The user merges all PRs; open PRs from branches, never push to `main`.

## Decisions already made
- Visual direction: light "white cube" gallery. The Figma file (PICASSO, node 460-3918) is **not yet applied** — the user will supply design details later. Current styling is structural only. The user's Figma seat is "View", so the Figma MCP cannot read it; ask the user for exports/specs.
- Logged-out visitors get a **server-enforced teaser** (newest 12 + featured). Anonymous filtering/search/pagination returns `401 "Log in to see more of the gallery."`. The client must not try to work around this. Image resolution is not limited yet (no image pipeline).
- Actions that need an account (bid, buy, wishlist, enter VR) go through `GatedAction`, which sends logged-out users to `/login?next=<current path>`.
- No VR when logged out: only a preview clip/animation (currently a CSS placeholder in `components/home/VrPreview.js`). Logged in: VR via a gallery provider such as Artsteps (placeholder button on `/home`).

## What exists
- `/` logged-out landing (server component, fetches teaser via `lib/catalogue-server.js`, revalidates every 60s).
- `/home` logged-in home (client, auth guard), restyled to the user's design (grey page, maroon `--brand` token, header with search + account menu, dark hero with VR card, horizontal rails). Real data: Artworks (cursor "Load more", `q` search from header), Curated for you (featured, no recommender yet), Explore Artists. Placeholders: Auctions, Art Exhibitions, Testimonials, Follow, wishlist heart, account-menu pages (shown as "soon"). Two user kinds: artists (`artist_status === "approved"` from `/auth/me`) additionally get My Artworks / My Exhibitions / Stats and a Submit Artwork button; viewers/buyers do not. Components in `components/home/` (`HomeHeader`, `Rails`).
- `/artworks/[slug]` artwork detail (client component): image gallery, title/artist/medium/year/size/category, description, price. Handles 401 ("Log in to see more" prompt), 404 and errors. Bid / Buy / Wishlist / VR are `GatedAction` placeholders. Artist name links to the artist page.
- `/artists/[slug]` artist profile (client): cover, name, medium, years, statement, website/Instagram links (http(s) only), Follow placeholder, works grid (`ArtworkCard`), "Showing a preview" note when the API returns `teaser: true`. 404 and error states. Linked from the detail page, rail cards and artist tiles.
- `/login`, `/signup` (honour a safe `?next=`, default `/home`), `/dashboard` (old stub).
- `lib/auth-api.js` (access token in **memory only**; localStorage holds just a non-secret `picasso_has_session` hint. `initSession()` restores the token from the httpOnly refresh cookie via `/auth/refresh` after a reload: always `await initSession()` before deciding someone is logged out, never read the token synchronously on mount. `authedRequest` refreshes once on 401), `lib/catalogue-api.js`, `lib/redirect.js` (`?next=` safety), `lib/format.js` (`formatINR`; money arrives as strings).

## Known issues / not built
- Next: no artists index/list page yet (the "View All" links in the design); `/artists/[slug]` exists. Then orders/wishlist/auctions once the backend has them.
- Figma: the user's file (key `dXP0ZeDxrfe28mGr44hp6y`, and a copy `snOLPIpiFTwi4HpVxPJw3O`) is unreadable via MCP ("no edit access", View seat). The user gave PNG exports instead (artist landing page, bidder verification modal): light grey page bg, maroon accent, bold grotesk headings, black pill buttons, small coloured tag on cards. No artwork-detail design exists yet, so the detail page uses structural styling.
- `/api/*` is proxied to the backend by `rewrites()` in `next.config.js` (host-independent; backend URL overridable via `BACKEND_URL`). Browser code uses a same-origin `API_BASE_URL` (`""`), server code hits the backend directly. Once merged, verify on Netlify that the refresh cookie persists a session past 15 min (frontend #5), then backend #18 can tighten CORS.
- **Which backend a build uses** is decided once in `next.config.js` and logged at build/dev start (`[picasso] API backend: ...`): `BACKEND_URL` if set, else production only for the Netlify production deploy (`CONTEXT=production`), else **staging** (`https://picasso-backend-staging.up.railway.app`, seeded: 30 artworks, 6 artists). So local dev, branch deploys and deploy previews use staging by default; `netlify.toml` sets it explicitly per context; override locally with `.env.local` (see `.env.example`). Staging demo-account passwords come from the backend's `SEED_USER_PASSWORD`, ask the backend owner.
- Backend does not yet have: auctions/bids, wishlist, testimonials, image upload/CDN, Studio, password reset. UI for these must stay placeholders.
- Production data is smoke-test data with `example.com` images (backend #20); use staging for realistic data. Seeded staging images may still be placeholders.
- `package-lock.json` is out of sync (`npm ci` fails; `npm install` fixes it) — commit the regenerated lockfile on its own.

## Conventions
- Colors via the oklch tokens in `globals.css`; no hard-coded hex.
- Artwork images use `components/ArtImage.js` (plain `<img>` with fallback), not `next/image`. It does **not** set a fit: callers pass `object-cover` (cropped 4:5 cards) or `object-contain` (show the whole image, e.g. the detail page), and `fallbackClassName` to size the placeholder. There is no image-host allowlist (no `remotePatterns`/CSP), so any host the API returns renders (R2, Cloudinary, Wikimedia on staging); keep it that way and use URLs exactly as returned.
- Verify before PRs: `npm run lint` and `npm run build`, plus a browser check.
