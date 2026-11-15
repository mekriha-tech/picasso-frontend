"use client";

import Link from "next/link";
import { useParams, usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import ArtImage from "@/components/ArtImage";
import ArtworkCard from "@/components/ArtworkCard";
import GatedAction from "@/components/GatedAction";
import SiteHeader from "@/components/home/SiteHeader";
import { getAccessToken } from "@/lib/auth-api";
import { getArtist } from "@/lib/catalogue-api";
import { loginPath } from "@/lib/redirect";

function Message({ title, children }) {
  return (
    <div className="mx-auto max-w-xl px-6 py-24 text-center">
      <h1 className="text-2xl font-medium tracking-tight">{title}</h1>
      <div className="mt-3 text-muted-foreground">{children}</div>
    </div>
  );
}

// Profile links come from user input: only ever link http(s) URLs, never other schemes.
function safeUrl(value) {
  try {
    const url = new URL(value);
    return url.protocol === "https:" || url.protocol === "http:" ? url.href : null;
  } catch {
    return null;
  }
}

function instagramUrl(value) {
  if (!value) return null;
  if (/^https?:\/\//i.test(value)) return safeUrl(value);
  const handle = value.replace(/^@/, "").trim();
  return /^[A-Za-z0-9._]+$/.test(handle) ? `https://www.instagram.com/${handle}` : null;
}

export default function ArtistPage() {
  const { slug } = useParams();
  const pathname = usePathname();
  const [artist, setArtist] = useState(null);
  const [state, setState] = useState("loading"); // loading | ok | notfound | error
  const [loggedIn, setLoggedIn] = useState(false);
  const [note, setNote] = useState(false);

  useEffect(() => {
    let live = true;
    (async () => {
      try {
        const data = await getArtist(slug);
        if (!live) return;
        setArtist(data);
        setLoggedIn(!!getAccessToken());
        setState("ok");
      } catch (err) {
        if (!live) return;
        setState(err.status === 404 ? "notfound" : "error");
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
      <Message title="Artist not found">
        <Link href="/" className="underline">
          Back to the gallery
        </Link>
      </Message>
    );
  } else if (state === "error") {
    body = <Message title="Something went wrong">Please try again in a moment.</Message>;
  } else {
    const a = artist;
    const website = safeUrl(a.website_url);
    const instagram = instagramUrl(a.instagram);
    const facts = [a.primary_medium, a.years_practising ? `${a.years_practising} years practising` : null].filter(Boolean);
    body = (
      <>
        <section className="mx-auto grid max-w-6xl gap-10 px-6 py-10 md:grid-cols-[2fr_3fr]">
          <div className="aspect-[4/5] overflow-hidden bg-muted">
            <ArtImage src={a.cover_image_url} alt={a.display_name} className="h-full w-full" />
          </div>
          <div>
            <h1 className="text-4xl font-semibold tracking-tight">{a.display_name}</h1>
            {facts.length > 0 && <p className="mt-2 text-muted-foreground">{facts.join(" · ")}</p>}
            {a.statement && (
              <p className="mt-6 whitespace-pre-line text-sm leading-relaxed">{a.statement}</p>
            )}
            {(website || instagram) && (
              <ul className="mt-6 flex gap-5 text-sm">
                {website && (
                  <li>
                    <a href={website} target="_blank" rel="noopener noreferrer" className="underline">
                      Website
                    </a>
                  </li>
                )}
                {instagram && (
                  <li>
                    <a href={instagram} target="_blank" rel="noopener noreferrer" className="underline">
                      Instagram
                    </a>
                  </li>
                )}
              </ul>
            )}
            <div className="mt-8">
              <GatedAction
                className="rounded-md border border-border-strong px-5 py-2 text-sm"
                onAllowed={() => setNote(true)}
              >
                Follow
              </GatedAction>
              {note && (
                <p role="status" className="mt-2 text-sm text-muted-foreground">
                  Following is coming soon.
                </p>
              )}
            </div>
          </div>
        </section>

        <section className="mx-auto max-w-6xl px-6 pb-16">
          <h2 className="mb-6 text-2xl font-semibold tracking-tight">Works</h2>
          {a.works?.length ? (
            <div className="grid grid-cols-2 gap-x-6 gap-y-10 md:grid-cols-3 lg:grid-cols-4">
              {a.works.map((w) => (
                <ArtworkCard key={w.id} artwork={w} />
              ))}
            </div>
          ) : (
            <p className="text-muted-foreground">No published works yet.</p>
          )}
          {a.teaser && (
            <p className="mt-8 text-sm text-muted-foreground">
              Showing a preview.{" "}
              <Link href={loginPath(pathname)} className="underline">
                Log in
              </Link>{" "}
              to see more of the gallery.
            </p>
          )}
        </section>
      </>
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
