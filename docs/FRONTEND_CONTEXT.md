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
- `/home` logged-in home (client, auth guard, featured + full collection with cursor "Load more").
- `/artworks/[slug]` artwork detail (client component): image gallery, title/artist/medium/year/size/category, description, price. Handles 401 ("Log in to see more" prompt), 404 and errors. Bid / Buy / Wishlist / VR are `GatedAction` placeholders. Artist name is plain text until artist pages exist.
- `/login`, `/signup` (honour a safe `?next=`, default `/home`), `/dashboard` (old stub).
- `lib/auth-api.js` (token in localStorage `picasso_access_token`; `authedRequest` refreshes once on 401), `lib/catalogue-api.js`, `lib/redirect.js` (`?next=` safety), `lib/format.js` (`formatINR`; money arrives as strings).

## Known issues / not built
- Next: artist pages (`/artists/[slug]`), then link the artist name on the detail page.
- Figma: the user's file (key `dXP0ZeDxrfe28mGr44hp6y`, and a copy `snOLPIpiFTwi4HpVxPJw3O`) is unreadable via MCP ("no edit access", View seat). The user gave PNG exports instead (artist landing page, bidder verification modal): light grey page bg, maroon accent, bold grotesk headings, black pill buttons, small coloured tag on cards. No artwork-detail design exists yet, so the detail page uses structural styling.
- Refresh cookie is cross-site (Netlify vs Railway), so sessions drop after 15 min until the Netlify `/api/*` proxy rewrite lands (frontend issue #5; backend #18 tightens CORS afterwards).
- Backend does not yet have: auctions/bids, wishlist, testimonials, image upload/CDN, Studio, password reset. UI for these must stay placeholders.
- Production data is smoke-test data with `example.com` images, so real artwork images will not show (backend #20).
- `package-lock.json` is out of sync (`npm ci` fails; `npm install` fixes it) — commit the regenerated lockfile on its own.

## Conventions
- Colors via the oklch tokens in `globals.css`; no hard-coded hex.
- Artwork images use `components/ArtImage.js` (plain `<img>` with fallback), not `next/image`.
- Verify before PRs: `npm run lint` and `npm run build`, plus a browser check.
