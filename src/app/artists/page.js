"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import SiteHeader from "@/components/home/SiteHeader";
import { ArtistTile } from "@/components/home/Rails";
import { getAccessToken } from "@/lib/auth-api";
import { listArtists } from "@/lib/catalogue-api";
import { loginPath } from "@/lib/redirect";

export default function ArtistsPage() {
  const pathname = usePathname();
  const [artists, setArtists] = useState(null);
  const [nextCursor, setNextCursor] = useState(null);
  const [teaser, setTeaser] = useState(false);
  const [loggedIn, setLoggedIn] = useState(false);
  const [loadingMore, setLoadingMore] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    let live = true;
    (async () => {
      try {
        const page = await listArtists({ limit: 12 });
        if (!live) return;
        setLoggedIn(!!getAccessToken());
        setArtists(page.items);
        setNextCursor(page.next_cursor);
        setTeaser(!!page.teaser);
      } catch (err) {
        if (live) setError(err?.message ?? "Something went wrong. Please try again.");
      }
    })();
    return () => {
      live = false;
    };
  }, []);

  async function loadMore() {
    setLoadingMore(true);
    try {
      const page = await listArtists({ limit: 12, cursor: nextCursor });
      setArtists((prev) => [...prev, ...page.items]);
      setNextCursor(page.next_cursor);
    } catch (err) {
      setError(err?.message ?? "Something went wrong. Please try again.");
    } finally {
      setLoadingMore(false);
    }
  }

  return (
    <div className="min-h-screen bg-muted">
      <SiteHeader
        right={
          <Link href={loggedIn ? "/home" : "/"} className="text-muted-foreground">
            ← Gallery
          </Link>
        }
      />
      <main className="mx-auto max-w-7xl px-6 py-10">
        <h1 className="mb-8 text-3xl font-semibold tracking-tight md:text-4xl">Artists</h1>

        {error && (
          <p role="alert" className="mb-6 text-destructive">
            {error}
          </p>
        )}
        {!artists && !error && <p className="text-muted-foreground">Loading…</p>}
        {artists?.length === 0 && <p className="text-muted-foreground">No artists to show yet.</p>}

        {artists?.length > 0 && (
          <div className="grid grid-cols-2 gap-x-6 gap-y-10 md:grid-cols-3 lg:grid-cols-4">
            {artists.map((a) => (
              <ArtistTile key={a.slug} artist={a} className="w-full" />
            ))}
          </div>
        )}

        {nextCursor && (
          <div className="mt-10 text-center">
            <button
              type="button"
              onClick={loadMore}
              disabled={loadingMore}
              className="rounded-full bg-primary px-5 py-2 text-sm text-primary-foreground"
            >
              {loadingMore ? "Loading…" : "Load more"}
            </button>
          </div>
        )}
        {/* Logged out, the API returns a fixed preview and refuses paging. */}
        {teaser && !loggedIn && (
          <p className="mt-10 text-center text-sm text-muted-foreground">
            Showing a preview.{" "}
            <Link href={loginPath(pathname)} className="underline">
              Log in
            </Link>{" "}
            to see all artists.
          </p>
        )}
      </main>
    </div>
  );
}
