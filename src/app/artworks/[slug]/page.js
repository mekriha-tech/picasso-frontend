"use client";

import Link from "next/link";
import { useParams, usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import ArtImage from "@/components/ArtImage";
import GatedAction from "@/components/GatedAction";
import SiteHeader from "@/components/home/SiteHeader";
import { getAccessToken } from "@/lib/auth-api";
import { getArtwork } from "@/lib/catalogue-api";
import { formatINR } from "@/lib/format";
import { loginPath } from "@/lib/redirect";

const BADGES = { auction: "Auction", sale: "For sale", display: "On display", sold: "Sold" };
const pill = "rounded-full px-5 py-2.5 text-sm";

function Detail({ label, value }) {
  if (!value) return null;
  return (
    <div>
      <dt className="text-xs uppercase tracking-wide text-muted-foreground">{label}</dt>
      <dd className="mt-0.5 text-sm text-foreground">{value}</dd>
    </div>
  );
}

function Message({ title, children }) {
  return (
    <div className="mx-auto max-w-xl px-6 py-24 text-center">
      <h1 className="text-2xl font-medium tracking-tight">{title}</h1>
      <div className="mt-3 text-muted-foreground">{children}</div>
    </div>
  );
}

export default function ArtworkPage() {
  const { slug } = useParams();
  const pathname = usePathname();
  const [artwork, setArtwork] = useState(null);
  const [state, setState] = useState("loading"); // loading | ok | login | notfound | error
  const [active, setActive] = useState(0);
  const [note, setNote] = useState("");
  const [loggedIn, setLoggedIn] = useState(false);

  useEffect(() => {
    let live = true;
    (async () => {
      try {
        const data = await getArtwork(slug);
        if (!live) return;
        setLoggedIn(!!getAccessToken());
        setArtwork(data);
        setState("ok");
      } catch (err) {
        if (!live) return;
        if (err.status === 404) setState("notfound");
        else if (err.status === 401) setState("login");
        else setState("error");
      }
    })();
    return () => {
      live = false;
    };
  }, [slug]);

  let body;
  if (state === "loading") {
    body = <Message title="Loading…" />;
  } else if (state === "notfound") {
    body = (
      <Message title="Artwork not found">
        <Link href="/" className="underline">
          Back to the gallery
        </Link>
      </Message>
    );
  } else if (state === "login") {
    body = (
      <Message title="Log in to see more of the gallery">
        <p>This work is outside the public preview.</p>
        <Link
          href={loginPath(pathname)}
          className={`${pill} mt-6 inline-block bg-primary text-primary-foreground`}
        >
          Log in
        </Link>
      </Message>
    );
  } else if (state === "error") {
    body = <Message title="Something went wrong">Please try again in a moment.</Message>;
  } else {
    const a = artwork;
    const images = a.images?.length
      ? [...a.images].sort((x, y) => x.sort_order - y.sort_order)
      : [{ url: a.primary_image_url, alt_text: a.title }];
    const current = images[Math.min(active, images.length - 1)];
    const price = formatINR(a.price ?? a.sold_price);
    const meta = [a.medium, a.year, a.category].filter(Boolean);
    const size =
      a.dimensions ?? (a.width_cm && a.height_cm ? `${a.width_cm} × ${a.height_cm} cm` : null);

    body = (
      <div className="mx-auto grid max-w-6xl gap-10 px-6 py-10 md:grid-cols-[3fr_2fr]">
        <div>
          <div className="bg-muted">
            <ArtImage
              src={current.url}
              alt={current.alt_text || a.title}
              className="min-h-80 max-h-[75vh] w-full object-contain"
            />
          </div>
          {images.length > 1 && (
            <ul className="mt-3 flex gap-3">
              {images.map((img, i) => (
                <li key={img.url}>
                  <button
                    type="button"
                    onClick={() => setActive(i)}
                    aria-label={`Show image ${i + 1}`}
                    aria-current={i === active}
                    className={`block h-16 w-16 overflow-hidden bg-muted ${
                      i === active ? "ring-2 ring-foreground" : "opacity-70"
                    }`}
                  >
                    <ArtImage src={img.url} alt="" className="h-full w-full" />
                  </button>
                </li>
              ))}
            </ul>
          )}
        </div>

        <div>
          <p className="text-xs uppercase tracking-wide text-muted-foreground">
            {a.sold ? "Sold" : (BADGES[a.badge] ?? a.badge)}
          </p>
          <h1 className="mt-2 text-3xl font-medium tracking-tight">{a.title}</h1>
          <p className="mt-1 text-muted-foreground">
            by{" "}
            <Link href={`/artists/${a.artist?.slug}`} className="underline">
              {a.artist?.display_name}
            </Link>
            {meta.length > 0 && <> · {meta.join(" · ")}</>}
          </p>

          {price && <p className="mt-6 text-2xl text-foreground">{price}</p>}

          {a.description && (
            <p className="mt-6 whitespace-pre-line text-sm leading-relaxed text-foreground">
              {a.description}
            </p>
          )}

          <dl className="mt-6 grid grid-cols-2 gap-4 border-t border-border pt-6">
            <Detail label="Medium" value={a.medium} />
            <Detail label="Year" value={a.year} />
            <Detail label="Size" value={size} />
            <Detail label="Category" value={a.category} />
          </dl>

          {/* Bidding, purchase, wishlist and VR are not in the backend yet: gated placeholders. */}
          <div className="mt-8 flex flex-wrap gap-3">
            {a.listing_type === "auction" && (
              <GatedAction
                className={`${pill} bg-primary text-primary-foreground`}
                onAllowed={() => setNote("Bidding is coming soon.")}
              >
                Place a bid
              </GatedAction>
            )}
            {a.listing_type === "sale" && !a.sold && (
              <GatedAction
                className={`${pill} bg-primary text-primary-foreground`}
                onAllowed={() => setNote("Purchasing is coming soon.")}
              >
                Buy now
              </GatedAction>
            )}
            <GatedAction
              className={`${pill} border border-border-strong`}
              onAllowed={() => setNote("Wishlist is coming soon.")}
            >
              Add to wishlist
            </GatedAction>
            <GatedAction
              className={`${pill} border border-border-strong`}
              onAllowed={() => setNote("The VR gallery is coming soon.")}
            >
              View in VR gallery
            </GatedAction>
          </div>
          {note && (
            <p role="status" className="mt-3 text-sm text-muted-foreground">
              {note}
            </p>
          )}
          {!loggedIn && (
            <p className="mt-3 text-sm text-muted-foreground">
              <Link href={loginPath(pathname)} className="underline">
                Log in
              </Link>{" "}
              to bid, buy, save or enter the VR gallery.
            </p>
          )}
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <SiteHeader
        right={
          <Link href={loggedIn ? "/home" : "/"} className="text-muted-foreground">
            ← Gallery
          </Link>
        }
      />
      {body}
    </div>
  );
}
