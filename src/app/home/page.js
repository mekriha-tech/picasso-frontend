"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import ArtworkCard from "@/components/ArtworkCard";
import GatedAction from "@/components/GatedAction";
import SiteHeader from "@/components/home/SiteHeader";
import { clearAccessToken, getAccessToken, getMe, logout } from "@/lib/auth-api";
import { getFeatured, listArtworks } from "@/lib/catalogue-api";
import { loginPath } from "@/lib/redirect";

const btn = "rounded-full bg-primary px-5 py-2.5 text-sm text-primary-foreground";

function Section({ title, children }) {
  return (
    <section className="mx-auto max-w-6xl px-6 py-10">
      <h2 className="mb-6 text-2xl font-medium tracking-tight">{title}</h2>
      {children}
    </section>
  );
}

function Grid({ items }) {
  if (!items?.length) return <p className="text-muted-foreground">Nothing here yet.</p>;
  return (
    <div className="grid grid-cols-2 gap-x-6 gap-y-10 md:grid-cols-3 lg:grid-cols-4">
      {items.map((a) => (
        <ArtworkCard key={a.id} artwork={a} />
      ))}
    </div>
  );
}

export default function HomePage() {
  const router = useRouter();
  const [user, setUser] = useState(null);
  const [featured, setFeatured] = useState(null);
  const [artworks, setArtworks] = useState([]);
  const [nextCursor, setNextCursor] = useState(null);
  const [loadingMore, setLoadingMore] = useState(false);
  const [error, setError] = useState("");
  const [vrNote, setVrNote] = useState(false);

  useEffect(() => {
    if (!getAccessToken()) {
      router.replace(loginPath("/home"));
      return;
    }
    let active = true;
    (async () => {
      try {
        const me = await getMe();
        const [feat, list] = await Promise.all([getFeatured(), listArtworks({ limit: 12 })]);
        if (!active) return;
        setUser(me);
        setFeatured(feat);
        setArtworks(list.items);
        setNextCursor(list.next_cursor);
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

  async function loadMore() {
    setLoadingMore(true);
    try {
      const page = await listArtworks({ limit: 12, cursor: nextCursor });
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

  return (
    <div className="min-h-screen bg-background text-foreground">
      <SiteHeader
        right={
          <>
            <span className="text-muted-foreground">{user?.full_name}</span>
            <button type="button" onClick={signOut}>
              Log out
            </button>
          </>
        }
      />
      {error && (
        <p role="alert" className="mx-auto max-w-6xl px-6 pt-6 text-destructive">
          {error}
        </p>
      )}

      <section className="mx-auto max-w-6xl px-6 pt-14">
        <h1 className="text-4xl font-medium tracking-tight">
          Welcome back{user?.full_name ? `, ${user.full_name.split(" ")[0]}` : ""}
        </h1>
      </section>

      {/* VR: placeholder for the gallery-provider integration (e.g. Artsteps). */}
      <Section title="Virtual gallery">
        <div className="flex flex-col items-start gap-4 rounded-xl bg-muted p-8">
          <p className="max-w-xl text-muted-foreground">
            Enter an immersive exhibition. This will open the gallery provider (e.g. Artsteps) once connected.
          </p>
          <GatedAction className={btn} onAllowed={() => setVrNote(true)}>
            Enter the gallery
          </GatedAction>
          {vrNote && <p className="text-sm text-muted-foreground">The virtual gallery is coming soon.</p>}
        </div>
      </Section>

      {featured?.auction?.length > 0 && (
        <Section title="Live auctions">
          <Grid items={featured.auction} />
        </Section>
      )}
      {featured?.sale?.length > 0 && (
        <Section title="Featured for sale">
          <Grid items={featured.sale} />
        </Section>
      )}

      <Section title="The collection">
        <Grid items={artworks} />
        {nextCursor && (
          <div className="mt-10 text-center">
            <button type="button" onClick={loadMore} disabled={loadingMore} className={btn}>
              {loadingMore ? "Loading…" : "Load more"}
            </button>
          </div>
        )}
      </Section>

      <footer className="border-t border-border py-8 text-center text-xs text-muted-foreground">
        <Link href="/">© Picasso</Link>
      </footer>
    </div>
  );
}
