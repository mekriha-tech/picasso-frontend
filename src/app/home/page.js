"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import GatedAction from "@/components/GatedAction";
import HomeHeader from "@/components/home/HomeHeader";
import { ArtistTile, ComingSoon, HomeFooter, Rail, RailCard, Section, Tabs } from "@/components/home/Rails";
import { clearAccessToken, getMe, initSession, logout } from "@/lib/auth-api";
import { getFeatured, listArtists, listArtworks } from "@/lib/catalogue-api";
import { loginPath } from "@/lib/redirect";

const pill = "rounded-full px-5 py-2 text-sm";

export default function HomePage() {
  const router = useRouter();
  const [user, setUser] = useState(null);
  const [featured, setFeatured] = useState(null);
  const [artworks, setArtworks] = useState([]);
  const [artists, setArtists] = useState([]);
  const [nextCursor, setNextCursor] = useState(null);
  const [query, setQuery] = useState("");
  const [loadingMore, setLoadingMore] = useState(false);
  const [error, setError] = useState("");
  const [heroNote, setHeroNote] = useState("");

  // Normal users (viewers/buyers) and artists share this page; artists get extra menu items.
  const isArtist = user?.artist_status === "approved";

  useEffect(() => {
    let active = true;
    (async () => {
      try {
        if (!(await initSession())) {
          if (active) router.replace(loginPath("/home"));
          return;
        }
        const me = await getMe();
        const [feat, list, artistList] = await Promise.all([
          getFeatured(),
          listArtworks({ limit: 12 }),
          listArtists({ limit: 6 }).catch(() => ({ items: [] })),
        ]);
        if (!active) return;
        setUser(me);
        setFeatured(feat);
        setArtworks(list.items);
        setNextCursor(list.next_cursor);
        setArtists(artistList.items);
      } catch (err) {
        if (!active) return;
        if (err?.status === 401) {
          clearAccessToken();
          router.replace(loginPath("/home"));
        } else {
          setError(err?.message ?? "Something went wrong. Please try again.");
        }
      }
    })();
    return () => {
      active = false;
    };
  }, [router]);

  async function search(q) {
    setQuery(q);
    setError("");
    try {
      const page = await listArtworks({ limit: 12, q });
      setArtworks(page.items);
      setNextCursor(page.next_cursor);
    } catch (err) {
      setError(err?.message ?? "Something went wrong. Please try again.");
    }
  }

  async function loadMore() {
    setLoadingMore(true);
    try {
      const page = await listArtworks({ limit: 12, cursor: nextCursor, q: query });
      setArtworks((prev) => [...prev, ...page.items]);
      setNextCursor(page.next_cursor);
    } catch (err) {
      setError(err?.message ?? "Something went wrong. Please try again.");
    } finally {
      setLoadingMore(false);
    }
  }

  async function signOut() {
    try {
      await logout();
    } catch {
      // clear locally either way
    }
    clearAccessToken();
    router.push("/");
  }

  if (!user && !error) {
    return <main className="flex min-h-screen items-center justify-center text-muted-foreground">Loading…</main>;
  }

  // "Curated for you" has no recommendation engine behind it yet: featured works for now.
  const curated = [...(featured?.sale ?? []), ...(featured?.auction ?? []), ...(featured?.display ?? [])];

  return (
    <div className="min-h-screen bg-muted text-foreground">
      <HomeHeader user={user} isArtist={isArtist} onSearch={search} onSignOut={signOut} />
      {error && (
        <p role="alert" className="mx-auto max-w-7xl px-6 pt-6 text-destructive">
          {error}
        </p>
      )}

      <section className="bg-gradient-to-b from-neutral-700 to-neutral-950 text-white">
        <div className="mx-auto max-w-7xl px-6 pb-8 pt-16 md:pt-24">
          <h1 className="text-6xl font-bold tracking-tight text-white/70 md:text-8xl">PICASSO</h1>
          <p className="mt-3 text-xl text-white/90 md:text-2xl">Where Art Finds Its Audience</p>
          <div className="mt-10 flex flex-col gap-5 rounded-xl bg-white/15 p-5 backdrop-blur md:flex-row md:items-center">
            <div className="md:w-72">
              <p className="font-medium">VR Gallery</p>
              <p className="mt-1 text-xs text-white/80">
                Join here to be part of the exhibition &amp; showcase your art.
              </p>
              <div className="mt-4 flex flex-wrap gap-2">
                <GatedAction
                  className={`${pill} bg-black text-white`}
                  onAllowed={() => router.push("/gallery")}
                >
                  Enter the gallery
                </GatedAction>
                {isArtist && (
                  <GatedAction
                    className={`${pill} border border-white/70`}
                    onAllowed={() => setHeroNote("Artwork submission is coming soon.")}
                  >
                    Submit Artwork
                  </GatedAction>
                )}
              </div>
              {heroNote && (
                <p role="status" className="mt-2 text-xs text-white/80">
                  {heroNote}
                </p>
              )}
            </div>
            {/* PLACEHOLDER preview strip until a real VR clip/provider is connected. */}
            <div
              role="img"
              aria-label="Preview of the virtual gallery"
              className="relative h-28 flex-1 overflow-hidden rounded-lg bg-white/10 md:h-32"
            >
              <div className="vr-drift absolute inset-0 flex gap-4 p-3">
                {[0, 1, 2, 3, 4, 5].map((i) => (
                  <div key={i} className="h-full w-1/5 shrink-0 rounded bg-white/25" />
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      <Section title={query ? `Results for “${query}”` : "Artworks"}>
        <Tabs tabs={["Newest", "Recently Viewed", "Wishlists Preview"]} active="Newest" />
        {artworks.length ? (
          <Rail label="Artworks">
            {artworks.map((a) => (
              <RailCard key={a.id} artwork={a} />
            ))}
          </Rail>
        ) : (
          <p className="text-muted-foreground">{query ? "No artworks match your search." : "Nothing here yet."}</p>
        )}
        {nextCursor && (
          <div className="mt-6 text-center">
            <button type="button" onClick={loadMore} disabled={loadingMore} className={`${pill} bg-primary text-primary-foreground`}>
              {loadingMore ? "Loading…" : "Load more"}
            </button>
          </div>
        )}
      </Section>

      {curated.length > 0 && !query && (
        <Section title="Curated for you">
          <Rail label="Curated for you">
            {curated.map((a) => (
              <RailCard key={a.id} artwork={a} />
            ))}
          </Rail>
        </Section>
      )}

      <Section title="Auctions">
        <Tabs tabs={["Live", "Upcoming", "Past"]} active="Live" />
        <ComingSoon>Live auctions and bidding are coming soon.</ComingSoon>
      </Section>

      <Section title="Art Exhibitions">
        <ComingSoon>Exhibitions are coming soon.</ComingSoon>
      </Section>

      <Section
        title="Explore Artists"
        action={
          <Link href="/artists" className="text-sm font-medium">
            View All →
          </Link>
        }
      >
        {artists.length ? (
          <Rail label="Artists">
            {artists.map((a) => (
              <ArtistTile key={a.slug} artist={a} />
            ))}
          </Rail>
        ) : (
          <p className="text-muted-foreground">No artists to show yet.</p>
        )}
      </Section>

      <Section title="Testimonials">
        <ComingSoon>Collector and artist stories are coming soon.</ComingSoon>
      </Section>

      <HomeFooter />
    </div>
  );
}
